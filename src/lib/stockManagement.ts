import { supabase } from '@/integrations/supabase/client';

export interface StockDeductionResult {
  success: boolean;
  failedProducts?: Array<{ productId: string; name: string; requested: number; available: number }>;
  error?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
}

/**
 * Validates that all cart items have sufficient stock
 */
export const validateStock = async (items: CartItem[]): Promise<StockDeductionResult> => {
  try {
    const productIds = items.map(item => item.productId);
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .in('id', productIds);

    if (error) {
      return { success: false, error: error.message };
    }

    const failedProducts: StockDeductionResult['failedProducts'] = [];

    for (const item of items) {
      const product = products?.find(p => p.id === item.productId);
      if (!product) {
        failedProducts.push({
          productId: item.productId,
          name: item.name,
          requested: item.quantity,
          available: 0
        });
      } else if (product.stock_quantity < item.quantity) {
        failedProducts.push({
          productId: item.productId,
          name: product.name,
          requested: item.quantity,
          available: product.stock_quantity
        });
      }
    }

    if (failedProducts.length > 0) {
      return { success: false, failedProducts };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Atomically deducts stock for all cart items
 * Uses database function for oversell protection
 */
export const deductStock = async (items: CartItem[]): Promise<StockDeductionResult> => {
  try {
    // First validate all items have stock
    const validation = await validateStock(items);
    if (!validation.success) {
      return validation;
    }

    // Deduct stock atomically using the database function
    for (const item of items) {
      const { data, error } = await supabase.rpc('deduct_stock', {
        p_product_id: item.productId,
        p_quantity: item.quantity
      });

      if (error) {
        console.error(`Failed to deduct stock for ${item.name}:`, error);
        return { success: false, error: `Failed to update stock for ${item.name}` };
      }

      if (data === false) {
        return {
          success: false,
          error: `Insufficient stock for ${item.name}. Please refresh and try again.`
        };
      }
    }

    // Check for low stock and send alert if needed
    checkAndSendLowStockAlert().catch(console.error);

    return { success: true };
  } catch (err: any) {
    console.error('Stock deduction error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Checks for low stock products and sends alert if found
 */
export const checkAndSendLowStockAlert = async (): Promise<void> => {
  try {
    const { data: lowStock, error } = await supabase.rpc('get_low_stock_products');
    
    if (error) {
      console.error('Error checking low stock:', error);
      return;
    }

    if (lowStock && lowStock.length > 0) {
      // Trigger the low stock alert edge function
      await supabase.functions.invoke('send-low-stock-alert');
    }
  } catch (err) {
    console.error('Failed to check/send low stock alert:', err);
  }
};
