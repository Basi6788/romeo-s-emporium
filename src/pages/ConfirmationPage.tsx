import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';

const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const [displayId, setDisplayId] = useState<string>('Generating ID...');
  
  // Checkout page se jo UUID mili hai
  const initialOrderId = location.state?.orderId; 

  useEffect(() => {
    const fetchSequentialId = async () => {
      if (!initialOrderId) {
        // Agar koi direct link se aya ho
        setDisplayId('N/A');
        return;
      }

      try {
        // Hum database se wo number mangwa rahe hain jo auto-increment hua hai
        const { data, error } = await supabase
          .from('orders')
          .select('order_number')
          .eq('id', initialOrderId)
          .single();

        if (error) {
           console.error("Error fetching order number:", error);
           // Fallback: Agar error aye to UUID ka chota hissa dikha do
           setDisplayId(`ORD-${initialOrderId.slice(0, 6).toUpperCase()}`);
           return;
        }

        if (data && data.order_number) {
          // Ye line number ko format karegi (e.g. 1 -> 001, 50 -> 050)
          const formattedNumber = data.order_number.toString().padStart(3, '0');
          setDisplayId(`ORD-${formattedNumber}`);
        } else {
          // Agar number null ho (purane orders ke liye)
          setDisplayId(`ORD-${initialOrderId.slice(0, 6).toUpperCase()}`);
        }
      } catch (err) {
        console.error("Unknown error:", err);
        setDisplayId(`ORD-${initialOrderId.slice(0, 6).toUpperCase()}`);
      }
    };

    fetchSequentialId();
  }, [initialOrderId]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-lg mx-auto text-center">
          {/* Animated Check Icon */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-tr from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center animate-scale-in">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl font-bold mb-4 animate-fade-in">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Thank you for your purchase. Your order has been received.
          </p>

          {/* Order Details Card */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 mb-8 shadow-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-primary/10">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Order ID</p>
                
                {/* ID Display Logic */}
                <p className="font-bold text-2xl tracking-tight text-primary min-w-[120px]">
                  {displayId === 'Generating ID...' ? (
                     <span className="flex items-center gap-2 text-base text-muted-foreground animate-pulse">
                        Generating...
                     </span>
                  ) : displayId}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-left border-t border-border/50 pt-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Order details have been emailed to you.
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link 
              to="/products" 
              className="px-6 py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors inline-flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> Continue Shopping
            </Link>
            <Link 
              to="/profile" 
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              Track Order <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmationPage;

