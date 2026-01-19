import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Package, ChevronLeft, Clock, Truck, CheckCircle, MapPin, 
  CreditCard, Phone, Mail, User, Calendar, Copy, Check
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
// import { getOrders, OrderData } from '@/lib/firebase'; // Firebase hata diya
import { supabase } from '@/integrations/supabase/client'; // Supabase add kar diya
import { toast } from 'sonner';
import gsap from 'gsap';

// OrderData interface yahan define kar di taa ke type error na aye
export interface OrderData {
  id: string;
  userId?: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
}

const statusConfig = {
  pending: { 
    color: 'text-amber-600', 
    bg: 'bg-amber-500/10',
    borderColor: 'border-amber-500',
    icon: Clock,
    label: 'Pending',
    description: 'Your order has been received and is being reviewed.',
    step: 1
  },
  processing: { 
    color: 'text-blue-600', 
    bg: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
    icon: Package,
    label: 'Processing',
    description: 'Your order is being prepared for shipment.',
    step: 2
  },
  shipped: { 
    color: 'text-purple-600', 
    bg: 'bg-purple-500/10',
    borderColor: 'border-purple-500',
    icon: Truck,
    label: 'Shipped',
    description: 'Your order is on its way to you.',
    step: 3
  },
  delivered: { 
    color: 'text-green-600', 
    bg: 'bg-green-500/10',
    borderColor: 'border-green-500',
    icon: CheckCircle,
    label: 'Delivered',
    description: 'Your order has been delivered successfully.',
    step: 4
  },
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Agar authentication zaroori hai to ye check rakhein, 
    // agar testing karni hai to filhal comment out kar sakte hain
    /* if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    */

    const fetchOrder = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // 1. Supabase se Data mangwana (Database call)
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          // 2. Data Mapping (Database ke snake_case ko React ke camelCase mein badalna)
          // Ye step bohot zaroori hai kyunke DB mein 'customer_name' hai aur Code 'customerName' dhoond raha hai
          const formattedOrder: OrderData = {
            id: data.id,
            createdAt: new Date(data.created_at),
            status: data.status as any,
            customerName: data.customer_name, // Mapping fixed
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            postalCode: data.postal_code, // Mapping fixed
            country: data.country,
            paymentMethod: data.payment_method, // Mapping fixed
            items: data.items, // JSONB array direct use hoga
            subtotal: Number(data.subtotal),
            shipping: Number(data.shipping),
            tax: Number(data.tax),
            total: Number(data.total),
            userId: data.user_id
          };
          
          setOrder(formattedOrder);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        toast.error('Order details load nahi ho sakay');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [isAuthenticated, id, navigate]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [loading, order]);

  const copyOrderId = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      toast.success('Order ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-48 bg-muted rounded-2xl" />
              <div className="h-48 bg-muted rounded-2xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-6">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/orders" className="btn-primary inline-block">
              Back to Orders
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8" ref={containerRef}>
        {/* Back Button */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">Order Details</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground">{order.id}</span>
                <button
                  onClick={copyOrderId}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-5 h-5" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">Order Status</h2>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-muted rounded-full">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${((status.step - 1) / 3) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <div className="flex justify-between relative">
              {Object.entries(statusConfig).map(([key, config]) => {
                const isActive = status.step >= config.step;
                const isCurrent = status.step === config.step;
                const Icon = config.icon;

                return (
                  <div key={key} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm mt-3 font-medium ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {config.label}
                    </span>
                    {isCurrent && (
                      <p className="text-xs text-muted-foreground mt-1 text-center max-w-[120px] hidden md:block">
                        {config.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Status Message */}
          <div className={`mt-8 p-4 rounded-xl ${status.bg} border ${status.borderColor}`}>
            <div className="flex items-start gap-3">
              <StatusIcon className={`w-5 h-5 ${status.color} mt-0.5`} />
              <div>
                <p className={`font-medium ${status.color}`}>{status.label}</p>
                <p className="text-sm text-muted-foreground">{status.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl"
                >
                  <div className="w-16 h-16 rounded-lg bg-background overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-border/50">
                <span>Total</span>
                <span className="text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Shipping Address
              </h2>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-muted-foreground">{order.address}</p>
                <p className="text-muted-foreground">
                  {order.city}, {order.postalCode}
                </p>
                <p className="text-muted-foreground">{order.country}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Contact Info
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{order.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{order.phone}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Method
              </h2>
              <p className="text-sm text-muted-foreground capitalize">
                {order.paymentMethod.replace('_', ' ')}
              </p>
            </div>

            {/* Need Help */}
            <div className="bg-muted/50 rounded-2xl p-6">
              <h3 className="font-medium mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about your order, please contact our support team.
              </p>
              <button className="btn-secondary w-full">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetailPage;
