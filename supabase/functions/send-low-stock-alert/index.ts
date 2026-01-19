import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "admin@example.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LowStockProduct {
  id: string;
  name: string;
  sku: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return new Response(JSON.stringify({ success: false, error: 'Email not configured' }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get low stock products using the function
    const { data: lowStockProducts, error } = await supabase.rpc('get_low_stock_products');

    if (error) {
      console.error("Error fetching low stock products:", error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!lowStockProducts || lowStockProducts.length === 0) {
      console.log("No low stock products found");
      return new Response(JSON.stringify({ success: true, message: 'No low stock products' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${lowStockProducts.length} low stock products`);

    // Generate email HTML
    const productsHtml = lowStockProducts.map((p: LowStockProduct) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${p.name}</strong>
          ${p.sku ? `<br><span style="color: #666; font-size: 12px;">SKU: ${p.sku}</span>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          <span style="color: ${p.stock_quantity === 0 ? '#EF4444' : '#F59E0B'}; font-weight: bold;">
            ${p.stock_quantity}
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${p.low_stock_threshold}
        </td>
      </tr>
    `).join('');

    const outOfStockCount = lowStockProducts.filter((p: LowStockProduct) => p.stock_quantity === 0).length;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⚠️ Low Stock Alert</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      The following products are running low on stock and need attention:
                    </p>
                    
                    ${outOfStockCount > 0 ? `
                    <div style="background-color: #FEE2E2; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
                      <span style="color: #DC2626; font-weight: 600;">🚨 ${outOfStockCount} product(s) are OUT OF STOCK!</span>
                    </div>
                    ` : ''}
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <thead>
                        <tr style="background-color: #f8f9fa;">
                          <th style="padding: 12px; text-align: left; font-weight: 600; color: #666;">Product</th>
                          <th style="padding: 12px; text-align: center; font-weight: 600; color: #666;">Current Stock</th>
                          <th style="padding: 12px; text-align: center; font-weight: 600; color: #666;">Threshold</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${productsHtml}
                      </tbody>
                    </table>
                    
                    <div style="text-align: center;">
                      <a href="#" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #EF4444); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                        Manage Inventory
                      </a>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                      This is an automated alert from your inventory management system.
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
        from: `Inventory Alert <${RESEND_FROM_EMAIL}>`,
        to: [ADMIN_EMAIL],
        subject: `⚠️ Low Stock Alert: ${lowStockProducts.length} product(s) need attention`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Email provider error:", emailData);
      return new Response(
        JSON.stringify({ success: false, error: emailData?.message || 'Failed to send email' }),
        { status: emailResponse.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Low stock alert sent successfully:", emailData);

    return new Response(JSON.stringify({ 
      success: true, 
      productCount: lowStockProducts.length,
      data: emailData 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-low-stock-alert function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
