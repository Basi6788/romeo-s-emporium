import { supabase } from '@/integrations/supabase/client';

export interface DbOrder {
  id?: string;
  user_id?: string;
  customer_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  payment_method?: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered';
  created_at?: string;
  updated_at?: string;
}

export const createDbOrder = async (orderData: Omit<DbOrder, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id,
        customer_name: orderData.customer_name,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address,
        city: orderData.city,
        postal_code: orderData.postal_code,
        country: orderData.country,
        payment_method: orderData.payment_method,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        tax: orderData.tax,
        total: orderData.total,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }


    return data.id;
  } catch (error) {
    console.error('Failed to create order:', error);
    return null;
  }
};

export const getDbOrders = async (userId?: string): Promise<DbOrder[]> => {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(order => ({
      ...order,
      items: order.items as DbOrder['items']
    })) as DbOrder[];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const updateDbOrderStatus = async (
  orderId: string, 
  newStatus: DbOrder['status']
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};
