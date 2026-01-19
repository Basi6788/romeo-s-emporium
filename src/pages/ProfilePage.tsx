import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
    UserCircleIcon, 
    Mail02Icon, 
    Logout03Icon, 
    PackageIcon, 
    FavouriteIcon, 
    Settings02Icon, 
    Camera01Icon, 
    SecurityCheckIcon, 
    Loading03Icon
} from 'hugeicons-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useUser, useClerk, UserProfile } from '@clerk/clerk-react';
import { toast } from 'sonner';

interface OrderSummary {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: any[];
}

const ProfilePage: React.FC = () => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // Orders state
  const [orders] = useState<OrderSummary[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    if (clerkUser) {
      setFormData({
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
      });
    }
  }, [clerkUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!clerkUser) return;
    setLoading(true);
    try {
      await clerkUser.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clerkUser) return;
    const promise = clerkUser.setProfileImage({ file });
    toast.promise(promise, {
      loading: 'Updating avatar...',
      success: 'Avatar updated!',
      error: 'Failed to update avatar',
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (e) {
      console.error("Logout Error", e);
    }
  };

  if (authLoading || !clerkLoaded) {
    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center">
                <Loading03Icon className="w-10 h-10 animate-spin text-primary" />
            </div>
        </Layout>
    );
  }

  if (!isAuthenticated && !clerkUser) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'orders', label: 'Orders', icon: PackageIcon },
    { id: 'wishlist', label: 'Wishlist', icon: FavouriteIcon },
    { id: 'settings', label: 'Settings & Security', icon: Settings02Icon },
  ];

  return (
    <Layout>
      {/* FIX: Added 'min-h-screen' to ensure the container has height.
         'relative z-10' keeps content above background.
      */}
      <div className="relative z-10 min-h-screen w-full">
        <div className="container mx-auto px-4 py-8">
            
            {/* Header - Glass Panel */}
            <div className="mb-8 p-6 glass-panel flex items-center justify-between backdrop-blur-md bg-background/30 border border-white/10 rounded-2xl">
                <div>
                    <h1 className="text-3xl font-bold font-display text-white">My Account</h1>
                    <p className="text-muted-foreground text-gray-300">Manage your profile and preferences</p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/20 backdrop-blur-sm">
                    <SecurityCheckIcon className="w-5 h-5 text-primary" variant="bulk" />
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">Clerk Secured</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
            
            {/* --- SIDEBAR --- */}
            <aside className="lg:w-72 shrink-0">
                <div className="glass-panel p-6 sticky top-24 overflow-hidden backdrop-blur-md bg-background/30 border border-white/10 rounded-2xl">
                
                {/* Avatar Section */}
                <div className="text-center mb-8 relative group">
                    <div className="relative w-28 h-28 mx-auto mb-4">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-violet-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/20">
                        <img src={clerkUser?.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                    </div>

                    <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/80 transition-colors shadow-lg z-20">
                        <Camera01Icon className="w-5 h-5" variant="bulk" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    </div>

                    <h2 className="font-bold text-xl font-display text-white">{clerkUser?.fullName}</h2>
                    <p className="text-sm text-gray-400 truncate max-w-[200px] mx-auto">
                        {clerkUser?.primaryEmailAddress?.emailAddress}
                    </p>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-2">
                    {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-medium ${
                        activeTab === id
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <Icon className="w-6 h-6" variant={activeTab === id ? 'bulk' : 'stroke'} />
                        {label}
                    </button>
                    ))}
                    
                    <div className="h-px bg-white/10 my-4" />
                    
                    <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-colors group"
                    >
                    <Logout03Icon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    Sign Out
                    </button>
                </nav>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 min-w-0">
                
                {/* 1. EDIT PROFILE TAB */}
                {activeTab === 'profile' && (
                <div className="glass-panel p-8 animate-in fade-in zoom-in-95 duration-300 backdrop-blur-md bg-background/30 border border-white/10 rounded-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold font-display text-white">Personal Information</h2>
                        <span className="text-xs text-gray-400 border border-white/10 px-3 py-1 rounded-full bg-white/5">
                            User ID: {clerkUser?.id?.slice(0, 10)}...
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">First Name</label>
                        <div className="relative group">
                            <UserCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="Enter first name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Last Name</label>
                        <div className="relative group">
                            <UserCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="Enter last name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                        <div className="relative">
                            <Mail02Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                            <input
                                type="email"
                                value={clerkUser?.primaryEmailAddress?.emailAddress || ''}
                                disabled
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-400 cursor-not-allowed"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <SecurityCheckIcon className="w-5 h-5 text-emerald-500" variant="bulk" />
                            </div>
                        </div>
                    </div>
                    </div>

                    <div className="mt-10 flex justify-end border-t border-white/10 pt-6">
                    <button 
                        onClick={handleSave} 
                        disabled={loading} 
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-medium transition-colors min-w-[160px] flex items-center justify-center gap-2"
                    >
                        {loading ? <Loading03Icon className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                    </button>
                    </div>
                </div>
                )}
                
                {/* 2. ORDERS TAB */}
                {activeTab === 'orders' && (
                <div className="glass-panel p-12 text-center animate-in fade-in zoom-in-95 duration-300 backdrop-blur-md bg-background/30 border border-white/10 rounded-2xl">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <PackageIcon className="w-10 h-10 text-gray-400" variant="bulk" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">No Orders Yet</h3>
                    <p className="text-gray-400 max-w-sm mx-auto mb-8">
                        Looks like you haven't placed any orders yet.
                    </p>
                    <button onClick={() => navigate('/products')} className="bg-primary text-white px-6 py-2 rounded-xl">
                        Start Shopping
                    </button>
                </div>
                )}

                {/* 3. SETTINGS TAB */}
                {activeTab === 'settings' && (
                <div className="animate-in fade-in zoom-in-95 duration-300 backdrop-blur-md bg-background/30 border border-white/10 rounded-2xl p-4">
                    <div className="clerk-profile-wrapper 
                        [&_.cl-card]:!bg-transparent [&_.cl-card]:!shadow-none [&_.cl-card]:!border-none 
                        [&_.cl-headerTitle]:text-white [&_.cl-headerSubtitle]:text-gray-400
                        [&_.cl-formFieldLabel]:text-white [&_.cl-formFieldInput]:!bg-black/20 [&_.cl-formFieldInput]:!border-white/10 [&_.cl-formFieldInput]:!text-white
                        overflow-hidden"
                    >
                        <UserProfile 
                            routing="hash"
                            appearance={{
                                elements: {
                                    rootBox: "w-full",
                                    navbar: "hidden",
                                    card: "shadow-none bg-transparent",
                                    scrollBox: "bg-transparent"
                                },
                            }}
                        />
                    </div>
                </div>
                )}

                {activeTab === 'wishlist' && (
                    <div className="glass-panel p-12 text-center animate-in fade-in zoom-in-95 duration-300 backdrop-blur-md bg-background/30 border border-white/10 rounded-2xl">
                        <FavouriteIcon className="w-16 h-16 mx-auto mb-4 text-rose-500" variant="bulk" />
                        <h3 className="text-xl font-bold mb-2 text-white">Your Wishlist</h3>
                        <p className="text-gray-400">Save items you want to buy later here.</p>
                    </div>
                )}
            </main>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;

