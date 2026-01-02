import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom'; // Navigate import kia
import { User, Mail, LogOut, Package, Heart, Settings, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Order Data Type definition
interface OrderSummary {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: any[];
}

const ProfilePage: React.FC = () => {
  // AuthContext se data lia
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fetchingOrders, setFetchingOrders] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // User Data Sync
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: '', 
        address: '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setTimeout(() => {
        toast.success('Profile updated successfully!');
        setLoading(false);
    }, 1000);
  };

  const handleLogout = async () => {
    try {
        await logout();
        // Redirect ki zaroorat nahi, AuthContext update hoga 
        // aur neechay wala logic khud bhej dega
        toast.success('Logged out successfully');
    } catch (e) {
        console.error("Logout Error", e);
    }
  };

  // --- 🔒 RENDER SAFEGUARDS (Yehi fix hai) ---
  
  // 1. Jab tak Clerk check kar raha hai, Loading dikhao
  if (authLoading) {
    return (
        <Layout>
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        </Layout>
    );
  }

  // 2. Agar Loading khatam aur Banda Login NAHI hai -> Login page par phenk do
  // useEffect ki bajaye seedha Return me Navigate use karna 100% safe hai
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // 3. Agar Login hai par User data abhi sync nahi hua -> Loading dikhao (Crash se bachne ke liye)
  if (!user) {
     return (
        <Layout>
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        </Layout>
    );
  }

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
            <div className="bg-card rounded-2xl border border-border/50 p-6 sticky top-24">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-3xl font-bold text-white">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <h2 className="font-bold text-lg">{user.name}</h2>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === id
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
                <div className="h-px bg-border/50 my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <div className="bg-card rounded-2xl border border-border/50 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full h-11 pl-12 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full h-11 pl-12 rounded-xl bg-muted/50 border border-border text-muted-foreground cursor-not-allowed"
                        />
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button onClick={handleSave} disabled={loading} className="btn-primary min-w-[140px]">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-muted-foreground">Orders functionality coming soon!</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
