import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, MapPin, ChevronLeft, Shield, Package, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder, OrderData } from '@/lib/firebase';
import { createDbOrder } from '@/lib/dbOrders';
import { sendOrderNotification } from '@/lib/orderNotifications';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CheckoutPage: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Pakistan',
    paymentMethod: 'cod',
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const shipping = total > 100 ? 0 : 15;
  const tax = total * 0.05;
  const grandTotal = total + shipping + tax;

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      // Create order in database (for realtime notifications)
      const dbOrderId = await createDbOrder({
        user_id: user?.id,
        customer_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        country: formData.country,
        payment_method: formData.paymentMethod,
        items: orderItems,
        subtotal: total,
        shipping,
        tax,
        total: grandTotal,
      });

      // Also save to localStorage as fallback
      const orderId = dbOrderId || await createOrder({
        userId: user?.id,
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        paymentMethod: formData.paymentMethod,
        items: orderItems,
        subtotal: total,
        shipping,
        tax,
        total: grandTotal,
      });

      // Send order confirmation email
      const orderData: OrderData = {
        id: orderId,
        userId: user?.id,
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        paymentMethod: formData.paymentMethod,
        items: orderItems,
        subtotal: total,
        shipping,
        tax,
        total: grandTotal,
        status: 'pending',
        createdAt: new Date(),
      };

      // Send order confirmation email (don't block order placement)
      const emailResult = await sendOrderNotification(orderData);
      if (!emailResult.success) {
        toast.error('Order placed, but email was not delivered', {
          description:
            emailResult.error ||
            'Email delivery is not configured yet. Please verify your sender domain.',
        });
      }

      clearCart();
      navigate('/confirmation', { state: { orderId } });
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <div className="p-6 rounded-full bg-muted/50 mb-6">
            <Package className="w-16 h-16 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">No items to checkout</h1>
          <p className="text-muted-foreground mb-6">Your cart is empty. Add some products first.</p>
          <Button asChild size="lg">
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const steps = [
    { num: 1, label: 'Contact', icon: MapPin },
    { num: 2, label: 'Shipping', icon: Truck },
    { num: 3, label: 'Payment', icon: CreditCard },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        {/* Header */}
        <div className="bg-card border-b border-border/50">
          <div className="container mx-auto px-4 py-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Back to Cart
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4 mb-8">
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <div 
                  className={`flex items-center gap-2 cursor-pointer transition-all ${
                    step >= s.num ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => setStep(s.num)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step >= s.num 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className="hidden sm:inline font-medium text-sm">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ${step > s.num ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <form onSubmit={handleSubmit} ref={containerRef} className="grid lg:grid-cols-5 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Contact Information */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Contact Information</h2>
                    <p className="text-sm text-muted-foreground">We'll use this to send order updates</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+92 300 1234567"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-violet-500/10">
                    <Truck className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Shipping Address</h2>
                    <p className="text-sm text-muted-foreground">Where should we deliver?</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="123 Main Street, Apt 4"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="Lahore"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      placeholder="54000"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="country">Country</Label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full h-11 px-3 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option>Pakistan</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Australia</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-amber-500/10">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Payment Method</h2>
                    <p className="text-sm text-muted-foreground">Select your preferred payment option</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
                    { value: 'card', label: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard' },
                    { value: 'easypaisa', label: 'EasyPaisa', icon: '📱', desc: 'Mobile wallet' },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                        formData.paymentMethod === method.value
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={formData.paymentMethod === method.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="text-2xl mb-2">{method.icon}</span>
                      <span className="font-medium text-sm text-center">{method.label}</span>
                      <span className="text-xs text-muted-foreground mt-1">{method.desc}</span>
                      {formData.paymentMethod === method.value && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Order Summary</h2>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6 max-h-[280px] overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="w-16 h-16 rounded-lg bg-background p-1.5 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                        <p className="font-semibold text-primary text-sm mt-1">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? 'text-emerald-500 font-medium' : ''}>
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (5%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  {shipping === 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      You qualify for free shipping!
                    </div>
                  )}

                  <div className="flex justify-between pt-4 border-t border-border/50">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 h-12 text-base font-semibold"
                  size="lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Place Order • ${grandTotal.toFixed(2)}
                    </span>
                  )}
                </Button>

                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Shield className="w-4 h-4" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Lock className="w-4 h-4" />
                      <span>Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Truck className="w-4 h-4" />
                      <span>Fast Delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;