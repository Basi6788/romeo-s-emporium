import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Camera, LogOut, Package, Heart, Settings } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    toast.success('Profile updated successfully!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64 shrink-0">
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-full h-full rounded-full gradient-bg flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="font-bold text-lg">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <h2 className="text-xl font-bold mb-6">Profile Information</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field pl-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field pl-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field pl-12"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="input-field pl-12"
                        placeholder="123 Main Street, City"
                      />
                    </div>
                  </div>
                </div>

                <button onClick={handleSave} className="btn-primary mt-6">
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">My Orders</h2>
                  <Link to="/orders" className="text-primary hover:underline text-sm font-medium">
                    View All Orders
                  </Link>
                </div>
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">Track your orders and view history</p>
                  <Link to="/orders" className="btn-primary inline-block">
                    Go to Orders
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <h2 className="text-xl font-bold mb-6">My Wishlist</h2>
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Your wishlist is empty</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <h2 className="text-xl font-bold mb-6">Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive order updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
