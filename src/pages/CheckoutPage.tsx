import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, MapPin, ChevronLeft, Shield } from 'lucide-react';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder } from '@/lib/firebase';
import { toast } from 'sonner';

const CheckoutPage: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const shipping = total > 100 ? 0 : 15;
  const tax = total * 0.05;
  const grandTotal = total + shipping + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderId = await createOrder({
        userId: user?.id,
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        paymentMethod: formData.paymentMethod,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal: total,
        shipping,
        tax,
        total: grandTotal,
      });

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
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">No items to checkout</h1>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        <h1 className="section-title mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="glass-liquid rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald" /> Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" placeholder="Full Name *" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="Email *" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input-field md:col-span-2" placeholder="Phone *" />
              </div>
            </div>

            {/* Shipping */}
            <div className="glass-liquid rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-violet" /> Shipping Address
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" name="address" value={formData.address} onChange={handleChange} required className="input-field md:col-span-2" placeholder="Address *" />
                <input type="text" name="city" value={formData.city} onChange={handleChange} required className="input-field" placeholder="City *" />
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required className="input-field" placeholder="Postal Code *" />
                <select name="country" value={formData.country} onChange={handleChange} className="input-field md:col-span-2">
                  <option>Pakistan</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                </select>
              </div>
            </div>

            {/* Payment */}
            <div className="glass-liquid rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber" /> Payment Method
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {['cod', 'card', 'easypaisa'].map((method) => (
                  <label key={method} className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all ${formData.paymentMethod === method ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                    <input type="radio" name="paymentMethod" value={method} checked={formData.paymentMethod === method} onChange={handleChange} className="sr-only" />
                    <span className="font-medium text-sm">{method === 'cod' ? 'Cash on Delivery' : method === 'easypaisa' ? 'EasyPaisa' : 'Card'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="glass-liquid rounded-3xl p-6 h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-contain bg-muted p-1" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                  </div>
                  <p className="font-semibold text-emerald">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t border-border/50 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-emerald">{shipping === 0 ? 'Free' : `$${shipping}`}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (5%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-border/50"><span>Total</span><span className="text-emerald">${grandTotal.toFixed(2)}</span></div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary mt-6 py-4 font-bold">
              {loading ? 'Processing...' : `Place Order • $${grandTotal.toFixed(2)}`}
            </button>
            <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> Secure checkout powered by Firebase
            </p>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CheckoutPage;