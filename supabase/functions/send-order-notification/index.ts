import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderNotificationRequest {
  orderId: string;
  customerName: string;
  email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  items: OrderItem[];
  total: number;
  address?: string;
  city?: string;
  trackingNumber?: string;
}

const statusMessages = {
  pending: {
    subject: 'Order Received - We\'re Processing Your Order',
    title: 'Thank You for Your Order!',
    message: 'We have received your order and are preparing it for shipment. You will receive another email when your order ships.',
    color: '#F59E0B',
  },
  processing: {
    subject: 'Your Order is Being Prepared',
    title: 'Order Update: Processing',
    message: 'Great news! Your order is now being prepared by our team. We\'ll notify you once it ships.',
    color: '#3B82F6',
  },
  shipped: {
    subject: 'Your Order Has Shipped! 🚚',
    title: 'Your Order is On the Way!',
    message: 'Exciting news! Your order has been shipped and is on its way to you.',
    color: '#8B5CF6',
  },
  delivered: {
    subject: 'Your Order Has Been Delivered ✓',
    title: 'Order Delivered!',
    message: 'Your order has been delivered successfully. We hope you love your purchase!',
    color: '#10B981',
  },
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'Missing RESEND_API_KEY' }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const data: OrderNotificationRequest = await req.json();
    const { orderId, customerName, email, status, items, total, address, city, trackingNumber } = data;

    console.log(`Sending order notification email to ${email} for order ${orderId} with status ${status}`);

    const statusInfo = statusMessages[status];
    
    // Generate items HTML
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" />` : ''}
            <span style="font-weight: 500;">${item.name}</span>
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}dd); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">${statusInfo.title}</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Hi ${customerName},
                    </p>
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                      ${statusInfo.message}
                    </p>
                    
                    <!-- Order Info Box -->
                    <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="color: #666; font-size: 14px;">Order ID:</span>
                          </td>
                          <td style="padding: 8px 0; text-align: right;">
                            <span style="color: #333; font-weight: 600; font-family: monospace;">${orderId}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="color: #666; font-size: 14px;">Status:</span>
                          </td>
                          <td style="padding: 8px 0; text-align: right;">
                            <span style="background-color: ${statusInfo.color}20; color: ${statusInfo.color}; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: capitalize;">${status}</span>
                          </td>
                        </tr>
                        ${trackingNumber ? `
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="color: #666; font-size: 14px;">Tracking:</span>
                          </td>
                          <td style="padding: 8px 0; text-align: right;">
                            <span style="color: #333; font-weight: 600;">${trackingNumber}</span>
                          </td>
                        </tr>
                        ` : ''}
                        ${address ? `
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="color: #666; font-size: 14px;">Delivery Address:</span>
                          </td>
                          <td style="padding: 8px 0; text-align: right;">
                            <span style="color: #333;">${address}${city ? `, ${city}` : ''}</span>
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>
                    
                    <!-- Order Items -->
                    <h3 style="color: #333; font-size: 18px; margin: 0 0 15px;">Order Items</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                      <thead>
                        <tr style="background-color: #f8f9fa;">
                          <th style="padding: 12px; text-align: left; font-weight: 600; color: #666; font-size: 14px;">Item</th>
                          <th style="padding: 12px; text-align: center; font-weight: 600; color: #666; font-size: 14px;">Qty</th>
                          <th style="padding: 12px; text-align: right; font-weight: 600; color: #666; font-size: 14px;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="2" style="padding: 16px 12px; text-align: right; font-weight: 700; font-size: 16px;">Total:</td>
                          <td style="padding: 16px 12px; text-align: right; font-weight: 700; font-size: 18px; color: ${statusInfo.color};">$${total.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="#" style="display: inline-block; background: linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}dd); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Track Your Order</a>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 14px; margin: 0 0 10px;">
                      Questions? Contact our support team anytime.
                    </p>
                    <p style="color: #999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} Your Store. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Order Updates <${RESEND_FROM_EMAIL}>`,
        to: [email],
        subject: `${statusInfo.subject} #${orderId}`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Email provider error:", emailData);
      return new Response(
        JSON.stringify({ success: false, error: emailData?.message || 'Failed to send email', data: emailData }),
        {
          status: emailResponse.status,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
