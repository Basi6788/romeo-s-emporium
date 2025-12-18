import { supabase } from "@/integrations/supabase/client";
import { OrderData } from "./firebase";

export interface NotificationResult {
  success: boolean;
  error?: string;
}

export const sendOrderNotification = async (
  order: OrderData
): Promise<NotificationResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: {
        orderId: order.id,
        customerName: order.customerName,
        email: order.email,
        status: order.status,
        items: order.items,
        total: order.total,
        address: order.address,
        city: order.city,
      },
    });

    if (error) {
      console.error('Error sending order notification:', error);
      return { success: false, error: error.message };
    }

    console.log('Order notification sent:', data);
    return { success: true };
  } catch (err: any) {
    console.error('Failed to send order notification:', err);
    return { success: false, error: err.message };
  }
};

export const sendOrderStatusUpdate = async (
  order: OrderData,
  newStatus: OrderData['status']
): Promise<NotificationResult> => {
  const updatedOrder = { ...order, status: newStatus };
  return sendOrderNotification(updatedOrder);
};
