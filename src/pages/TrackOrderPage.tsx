import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  total: number;
  customer_name: string;
  items: OrderItem[];
  address?: string;
  city?: string;
  country?: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId.trim())
        .single();

      if (error || !data) {
        toast.error('Order not found');
        setOrder(null);
      } else {
        setOrder({
          ...data,
          items: (data.items as unknown as OrderItem[]) || []
        });
      }
    } catch {
      toast.error('Failed to track order');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStep = () => {
    if (!order) return -1;
    const index = statusSteps.findIndex(s => s.key === order.status);
    return index === -1 ? 0 : index;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">Enter your order ID to see real-time status</p>
          </div>

          {/* Search Form */}
          <Card className="mb-8 border-border/50 shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleTrack} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter order ID (e.g., abc123-def456)"
                    className="pl-12 h-12 rounded-xl bg-muted/50 border-border"
                  />
                </div>
                <Button type="submit" disabled={loading} className="h-12 px-6 rounded-xl">
                  {loading ? 'Tracking...' : 'Track'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Status */}
          {order && (
            <div className="space-y-6 animate-fade-in">
              {/* Progress Steps */}
              <Card className="border-border/50 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-violet-500/10 p-6 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Order ID</span>
                    <span className="font-mono text-sm text-foreground">{order.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Placed on</span>
                    <span className="text-sm text-foreground">{format(new Date(order.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-6 right-6 h-1 bg-muted rounded-full">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${(getCurrentStep() / (statusSteps.length - 1)) * 100}%` }}
                      />
                    </div>

                    {/* Steps */}
                    <div className="relative flex justify-between">
                      {statusSteps.map((step, index) => {
                        const isActive = index <= getCurrentStep();
                        const isCurrent = index === getCurrentStep();
                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div className={`
                              w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                              ${isActive 
                                ? 'bg-gradient-to-br from-primary to-violet-500 text-white shadow-lg shadow-primary/30' 
                                : 'bg-muted text-muted-foreground'}
                              ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                            `}>
                              <step.icon className="w-5 h-5" />
                            </div>
                            <span className={`mt-3 text-xs font-medium text-center ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-foreground">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-xl font-bold text-foreground">${order.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {order.address && (
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">Shipping Address</h3>
                    <p className="text-muted-foreground">
                      {order.address}<br />
                      {order.city && `${order.city}, `}{order.country}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* View Full Order */}
              <Link to={`/orders/${order.id}`}>
                <Button variant="outline" className="w-full h-12 rounded-xl gap-2">
                  View Full Order Details <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}

          {/* No Order Found */}
          {!order && !loading && orderId && (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Order Not Found</h3>
                <p className="text-muted-foreground">Please check your order ID and try again</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TrackOrderPage;
