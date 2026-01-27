import { supabase } from '@/integrations/supabase/client';

export interface DbOrder {
  id?: string;
  user_id?: string;
  store_id: string; 
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
}

export const createDbOrder = async (
  orderData: Omit<DbOrder, 'id' | 'created_at' | 'updated_at' | 'status'>,
  token?: string | null
): Promise<string | null> => {
  try {
    console.log("Processing Order for Database...", orderData);

    // 1. Random Order Number Generate karo (Zaroori hai DB ke liye)
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // 2. Address fields ko combine kar lo kyunke DB me alag columns nahi hain abhi
    const fullAddress = `${orderData.address}, ${orderData.city || ''}, ${orderData.postal_code || ''}, ${orderData.country || ''}`;

    // 3. Pehle 'orders' table me insert karo
    let orderQuery = supabase.from('orders').insert({
      store_id: orderData.store_id,
      order_number: orderNumber, // 🔥 FIXED: Required field added
      
      customer_name: orderData.customer_name,
      customer_email: orderData.email,
      customer_phone: orderData.phone,
      customer_address: fullAddress, // 🔥 FIXED: Combined address

      // Note: user_id, payment_method, city waghera agar DB me nahi hain to remove kar diye hain taake error na aye.
      // Agar future me columns banao to yahan add kar dena.
      
      total_amount: orderData.total,
      shipping_amount: orderData.shipping,
      status: 'pending'
    });

    if (token) {
      (orderQuery as any).setHeader('Authorization', `Bearer ${token}`);
    }

    const { data: orderResult, error: orderError } = await orderQuery.select('id').single();

    if (orderError) {
      console.error('Supabase Order Insert Error:', orderError);
      throw orderError;
    }

    const newOrderId = orderResult.id;
    console.log("Order Table Created, ID:", newOrderId);

    // 4. Ab 'order_items' table me items insert karo (Loop ke zariye)
    const orderItemsData = orderData.items.map((item) => ({
      order_id: newOrderId,          // Link item to the order
      product_id: item.productId,
      product_name: item.name,
      product_image: item.image || '',
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Supabase Order Items Error:', itemsError);
      // Optional: Agar items fail hon to main order delete kar sakte ho, lekin abhi throw kar do
      throw itemsError;
    }

    console.log("Order Items Placed Successfully");
    return newOrderId;

  } catch (error) {
    console.error('Failed to create order:', error);
    return null;
  }
};

// Orders Fetch Karne Ka Function
export const getDbOrders = async (userId?: string, token?: string | null): Promise<DbOrder[]> => {
  try {
    // Join query to fetch orders AND their items
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    // Note: 'user_id' column shayad orders table me nahi hai (screenshots me nahi dikha), 
    // agar seller_id ya store_id se filter karna hai to wo use karo.
    // Filhal main user_id check hata raha hun agar column missing hai.
    // if (userId) { query = query.eq('user_id', userId); } 

    if (token) {
      (query as any).setHeader('Authorization', `Bearer ${token}`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((order: any) => ({
      id: order.id,
      store_id: order.store_id,
      created_at: order.created_at,
      status: order.status,
      customer_name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      address: order.customer_address,
      
      // Ye fields DB se wapis nahi aayengi kyunke DB me save nahi huin (unless columns bana lo)
      city: '', 
      country: '',
      postal_code: '',
      payment_method: '', // Agar payment gateway integrate ho to metadata me rakhna

      // Items ko wapis frontend format me map karna
      items: order.order_items.map((item: any) => ({
        productId: item.product_id,
        name: item.product_name,
        price: item.unit_price,
        quantity: item.quantity,
        image: item.product_image
      })),

      total: order.total_amount,
      shipping: order.shipping_amount,
      tax: 0,
      subtotal: (order.total_amount || 0) - (order.shipping_amount || 0)
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
    console.error('Error updating status:', error);
    return false;
  }
};
	
