import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image: string | null;
  category: string;
  rating: number | null;
  reviews: number | null;
  colors: string[] | null;
  in_stock: boolean | null;
  featured: boolean | null;
  stock_quantity: number;
  low_stock_threshold: number;
  sku: string | null;
  created_at: string;
  updated_at: string;
}

export const useInventory = () => {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newQuantity,
          in_stock: newQuantity > 0 
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: 'Stock Updated',
        description: 'Product stock has been updated successfully',
      });

      return true;
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to update stock',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateLowStockThreshold = async (productId: string, threshold: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ low_stock_threshold: threshold })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: 'Threshold Updated',
        description: 'Low stock threshold has been updated',
      });

      return true;
    } catch (error) {
      console.error('Error updating threshold:', error);
      toast({
        title: 'Error',
        description: 'Failed to update threshold',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts((prev) => [payload.new as DbProduct, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts((prev) =>
              prev.map((p) => (p.id === (payload.new as DbProduct).id ? payload.new as DbProduct : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) => prev.filter((p) => p.id !== (payload.old as DbProduct).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const lowStockProducts = products.filter(
    (p) => p.stock_quantity <= p.low_stock_threshold
  );

  const outOfStockProducts = products.filter((p) => p.stock_quantity === 0);

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.price * p.stock_quantity,
    0
  );

  return {
    products,
    loading,
    lowStockProducts,
    outOfStockProducts,
    totalInventoryValue,
    updateStock,
    updateLowStockThreshold,
    refetch: fetchProducts,
  };
};
