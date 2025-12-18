import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';

const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || `ORD-${Date.now()}`;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full gradient-bg flex items-center justify-center animate-scale-in">
            <CheckCircle className="w-12 h-12 text-primary-foreground" />
          </div>

          <h1 className="text-3xl font-bold mb-4 animate-fade-in">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          <div className="bg-card rounded-2xl border border-border/50 p-6 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Package className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-bold text-lg">{orderId}</p>
              </div>
            </div>

            <div className="space-y-4 text-left border-t border-border pt-6">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">
                  We'll email order updates to the address you provided.
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/products" className="btn-secondary inline-flex items-center justify-center gap-2">
              Continue Shopping
            </Link>
            <Link to="/profile" className="btn-primary inline-flex items-center justify-center gap-2">
              View Orders <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmationPage;
