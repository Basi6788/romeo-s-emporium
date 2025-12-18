import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderNotification {
  id: string;
  customer_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  payment_method?: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  status: string;
  created_at: string;
  items: any[];
}

export const useRealtimeOrders = (isAdmin: boolean = false) => {
  const [newOrder, setNewOrder] = useState<OrderNotification | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    console.log('Setting up realtime order subscription...');

    const channel = supabase
      .channel('admin-order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('New order received:', payload);
          const order = payload.new as OrderNotification;
          setNewOrder(order);
          
          // Show toast notification
          toast.success(
            `New Order from ${order.customer_name}`,
            {
              description: `Order total: $${Number(order.total).toFixed(2)}`,
              duration: 10000,
              action: {
                label: 'View',
                onClick: () => {
                  window.location.href = '/admin/orders';
                }
              }
            }
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order updated:', payload);
          const order = payload.new as OrderNotification;
          toast.info(
            `Order Status Updated`,
            {
              description: `Order for ${order.customer_name} is now ${order.status}`,
              duration: 5000
            }
          );
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  return { newOrder };
};

export const useOrdersSubscription = () => {
  const [orders, setOrders] = useState<OrderNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial orders
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders((data || []).map(order => ({
          ...order,
          items: order.items as any[]
        })) as OrderNotification[]);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Subscribe to changes
    const channel = supabase
      .channel('orders-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Orders change:', payload);
          
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new as OrderNotification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => 
              prev.map(order => 
                order.id === payload.new.id ? payload.new as OrderNotification : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(order => order.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { orders, loading };
};
