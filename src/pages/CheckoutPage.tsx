import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, Truck, MapPin, ChevronLeft, Shield, 
  Package, CheckCircle2, Lock, Sparkles, User, Mail, Phone 
} from 'lucide-react';
import { gsap } from 'gsap';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth, useUser } from '@clerk/clerk-react'; 
// import { createOrder } from '@/lib/firebase'; // Optional: Agar firebase hatana hai to remove kar do
import { createDbOrder } from '@/lib/dbOrders';
import { sendOrderNotification } from '@/lib/orderNotifications';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CheckoutPage: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { getToken, userId } = useAuth(); 
  const { user } = useUser();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.fullName || user?.firstName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Pakistan',
    paymentMethod: 'cod',
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Calculations
  const shipping = total > 100 ? 0 : 15;
  const tax = total * 0.05; // 5% Tax
  const grandTotal = total + shipping + tax;

  // Animation on Mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address || !formData.city || !formData.phone) {
      toast.error("Please fill in all delivery details");
      return;
    }

    setLoading(true);

    try {
      // 1. Get Supabase Token
      const token = await getToken({ template: 'supabase' });
      
      const orderItems = items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      console.log("Submitting Order...");

      // 2. Create Order in Supabase
      const dbOrderId = await createDbOrder({
        user_id: userId || undefined,
        store_id: items[0]?.storeId || 'default-store', // Assuming logic based on cart
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
      }, token);

      if (!dbOrderId) {
        throw new Error("Failed to create order in database");
      }

      // 3. Prepare Data for Notification
      const finalOrderData = {
        id: dbOrderId,
        userId: userId,
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

      // 4. Send Email
      await sendOrderNotification(finalOrderData);

      // 5. Success
      clearCart();
      navigate('/confirmation', { state: { orderId: dbOrderId } });
      toast.success('Order placed successfully!');

    } catch (error: any) {
      console.error('Checkout Error:', error);
      toast.error(`Order Failed: ${error.message || 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };

  // Empty Cart State
  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-muted/10">
          <div className="p-8 rounded-full bg-primary/10 mb-6 animate-pulse">
            <Package className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Looks like you haven't added anything to your cart yet. Explore our products and find something you love.
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50 pb-20">
        
        {/* Top Navigation */}
        <div className="bg-white border-b sticky top-0 z-30 supports-[backdrop-filter]:bg-white/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Cart
            </button>
            <div className="font-semibold text-lg">Secure Checkout</div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div ref={containerRef} className="grid lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: FORMS */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Progress Steps */}
              <div className="flex items-center justify-between px-2 mb-8">
                {['Contact', 'Shipping', 'Payment'].map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      i + 1 <= currentStep 
                        ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' 
                        : 'bg-white border-gray-200 text-gray-400'
                    }`}>
                       {i + 1 < currentStep ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                    </div>
                    <span className={`text-xs font-medium ${i + 1 <= currentStep ? 'text-primary' : 'text-gray-400'}`}>
                      {step}
                    </span>
                  </div>
                ))}
                {/* Connector Line */}
                <div className="absolute top-16 left-0 w-full h-0.5 bg-gray-200 -z-0 hidden md:block" /> 
              </div>

              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Section 1: Contact Info */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dashed">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <User className="w-4 h-4" />
                    </div>
                    <h2 className="font-semibold text-lg">Contact Information</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Ex: Romeo"
                          className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="+92 300 1234567"
                          className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="romeo@example.com"
                          className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Shipping Address */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dashed">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h2 className="font-semibold text-lg">Shipping Address</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Full Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        placeholder="House #, Street, Area"
                        className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white"
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
                        placeholder="Faisalabad"
                        className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white"
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
                        placeholder="38000"
                        className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Payment Method */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dashed">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <h2 className="font-semibold text-lg">Payment Method</h2>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { id: 'cod', name: 'Cash on Delivery', icon: '💵', desc: 'Pay at your door' },
                      { id: 'card', name: 'Credit Card', icon: '💳', desc: 'Secure checkout' },
                      { id: 'easypaisa', name: 'EasyPaisa', icon: '📱', desc: 'Instant transfer' }
                    ].map((method) => (
                      <label 
                        key={method.id}
                        className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          formData.paymentMethod === method.id 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                            : 'border-transparent bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="text-2xl mb-2">{method.icon}</span>
                        <span className={`font-medium text-sm ${formData.paymentMethod === method.id ? 'text-primary' : ''}`}>
                          {method.name}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">{method.desc}</span>
                        
                        {formData.paymentMethod === method.id && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: SUMMARY */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-6">
                
                {/* Order Summary Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Sparkles className="w-4 h-4" />
                      <h3>Order Summary</h3>
                    </div>
                  </div>

                  <div className="p-6 max-h-[350px] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4 group">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 p-1 overflow-hidden border border-gray-200">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity} × ${item.price}</p>
                          </div>
                          <div className="font-semibold text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50/30 border-t border-gray-100 space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax (5%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-4 border-t border-dashed flex justify-between items-center">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-bold text-2xl text-primary">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Button
                      onClick={(e) => {
                         const form = document.getElementById('checkout-form') as HTMLFormElement;
                         if (form) form.requestSubmit();
                      }}
                      disabled={loading}
                      className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all rounded-xl"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing Order...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock className="w-5 h-5" />
                          Confirm Order
                        </div>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      <span>Secure SSL Encryption</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-blue-900">Fast & Reliable Delivery</h4>
                    <p className="text-xs text-blue-700/80 mt-1">
                      We ensure your products arrive safe and on time.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;

