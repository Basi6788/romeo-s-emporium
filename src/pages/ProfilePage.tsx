import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
    User,
    Package,
    Heart,
    Settings,
    LogOut,
    Camera,
    ShieldCheck,
    Loader2,
    LayoutDashboard,
    Mail,
    ChevronRight,
    CheckCircle2
} from 'lucide-react';
import { gsap } from 'gsap';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useUser, useClerk, UserProfile } from '@clerk/clerk-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  createdAt: string;
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
  const [orders, setOrders] = useState<Order[]>([]);

  // Animation Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Store refs for tabs to animate them individually if needed
  tabRefs.current = [];

  const addToTabRefs = (el: HTMLButtonElement | null) => {
    if (el && !tabRefs.current.includes(el)) {
        tabRefs.current.push(el);
    }
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });

  // --- ADMIN LOGIC ---
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;
  const isAdmin = userEmail === 'bbasitahmad1213@gmail.com';

  // 1. Initial Load Animation (Complex Sequence)
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Header Fade In
        tl.fromTo(headerRef.current, 
            { opacity: 0, y: -30 }, 
            { opacity: 1, y: 0, duration: 0.6 }
        );

        // Sidebar Slide In
        tl.fromTo(sidebarRef.current, 
            { opacity: 0, x: -40 }, 
            { opacity: 1, x: 0, duration: 0.6 }, 
            "-=0.4"
        );

        // Avatar Pop (Elastic effect)
        tl.fromTo(avatarRef.current,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" },
            "-=0.4"
        );

        // Stagger Tabs (Wave effect)
        if (tabRefs.current.length > 0) {
            tl.fromTo(tabRefs.current, 
                { opacity: 0, x: -20, autoAlpha: 0 },
                { opacity: 1, x: 0, autoAlpha: 1, duration: 0.4, stagger: 0.08 },
                "-=0.6"
            );
        }

        // Content Fade In
        tl.fromTo(contentRef.current,
            { opacity: 0, y: 30, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.2)" },
            "-=0.4"
        );

    });

    return () => ctx.revert();
  }, []);

  // 2. Tab Switch Animation (Smoother & Snappier)
  useEffect(() => {
    if (contentRef.current) {
        // Kill previous tweens to avoid conflicts
        gsap.killTweensOf(contentRef.current);
        
        // Animate new content in with a slight "Pop" up
        gsap.fromTo(contentRef.current,
            { opacity: 0, y: 15, scale: 0.99 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "circ.out" }
        );
    }
  }, [activeTab]);

  useEffect(() => {
    if (clerkUser) {
      setFormData({
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
      });
    }
  }, [clerkUser]);

  useEffect(() => {
    if (activeTab === 'orders') {
        setOrders([]); 
    }
  }, [activeTab]);

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
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        </Layout>
    );
  }

  if (!isAuthenticated && !clerkUser) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Layout>
      <div className="min-h-screen w-full bg-gray-50 dark:bg-black transition-colors duration-300">
        <div className="container mx-auto px-4 py-8 lg:py-12">

            {/* Header */}
            <div ref={headerRef} className="opacity-0 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                        Profile
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                        Manage your account settings and preferences.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Admin Button - Updated Link */}
                    {isAdmin && (
                        <button 
                            onClick={() => navigate('/admin')}
                            className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                        >
                            <LayoutDashboard size={20} className="group-hover:rotate-12 transition-transform" />
                            <span>Admin Panel</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

            {/* --- SIDEBAR --- */}
            <aside ref={sidebarRef} className="opacity-0 lg:w-80 shrink-0 z-10">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm sticky top-24">

                    {/* BIG AVATAR SECTION */}
                    <div className="text-center mb-8 pt-4">
                        <div ref={avatarRef} className="relative w-40 h-40 mx-auto mb-6 group opacity-0">
                            {/* Gradient Ring */}
                            <div className="absolute -inset-1 bg-gradient-to-br from-primary via-purple-500 to-blue-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                            
                            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-900 shadow-2xl">
                                <img src={clerkUser?.imageUrl} alt="Profile" className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            
                            <label className="absolute bottom-1 right-1 p-3 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-transform hover:scale-110 shadow-lg border-4 border-white dark:border-gray-900">
                                <Camera size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>

                        <h2 className="font-extrabold text-2xl text-gray-900 dark:text-white tracking-tight">{clerkUser?.fullName}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="space-y-2">
                        {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            ref={addToTabRefs}
                            onClick={() => setActiveTab(id)}
                            className={`opacity-0 relative w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 font-bold ${
                            activeTab === id
                                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02] translate-x-2'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:translate-x-1'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <Icon size={22} className={activeTab === id ? "animate-pulse" : ""} strokeWidth={activeTab === id ? 2.5 : 2} />
                                <span>{label}</span>
                            </div>
                            {activeTab === id && (
                                <ChevronRight size={18} className="opacity-80 animate-in slide-in-from-left-2 duration-300" />
                            )}
                        </button>
                        ))}

                        <div className="h-px bg-gray-200 dark:bg-gray-800 my-6" />

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors font-bold group"
                        >
                            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
                            Sign Out
                        </button>
                    </nav>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 min-w-0">
                
                {/* Wrapped in a div for GSAP to target cleanly */}
                <div ref={contentRef} className="opacity-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm min-h-[600px] overflow-hidden relative">
                    
                    {/* 1. PROFILE EDIT */}
                    {activeTab === 'profile' && (
                    <div className="p-8 md:p-10">
                        <div className="mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Update your personal details here.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">First Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                                        placeholder="Enter first name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Last Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Email Address</label>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-4 z-10 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={clerkUser?.primaryEmailAddress?.emailAddress || ''}
                                        disabled
                                        className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-32 text-gray-500 font-medium cursor-not-allowed"
                                    />
                                    <div className="absolute right-4 flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                    )}

                    {/* 2. ORDERS TAB */}
                    {activeTab === 'orders' && (
                    <div className="p-8 md:p-10 h-full flex flex-col">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Order History</h2>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-gray-900/50 m-2">
                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Package className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Orders Yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
                                You haven't placed any orders yet. Check out our store to get started!
                            </p>
                            <button onClick={() => navigate('/products')} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-transform hover:scale-105 shadow-lg">
                                Start Shopping
                            </button>
                        </div>
                    </div>
                    )}

                    {/* 3. SETTINGS TAB */}
                    {activeTab === 'settings' && (
                    <div className="p-6 md:p-8">
                        <div className="clerk-custom-wrapper 
                            [&_.cl-rootBox]:w-full 
                            [&_.cl-card]:!bg-transparent [&_.cl-card]:!shadow-none [&_.cl-card]:!border-none 
                            [&_.cl-headerTitle]:!text-gray-900 [&_.cl-headerTitle]:dark:!text-white [&_.cl-headerTitle]:!font-bold [&_.cl-headerTitle]:!text-2xl
                            [&_.cl-headerSubtitle]:!text-gray-500 [&_.cl-headerSubtitle]:dark:!text-gray-400
                            [&_.cl-formFieldLabel]:!text-gray-700 [&_.cl-formFieldLabel]:dark:!text-gray-300 [&_.cl-formFieldLabel]:!font-bold
                            [&_.cl-formFieldInput]:!bg-gray-50 [&_.cl-formFieldInput]:dark:!bg-black/40 
                            [&_.cl-formFieldInput]:!border-gray-200 [&_.cl-formFieldInput]:dark:!border-gray-700 
                            [&_.cl-formFieldInput]:!text-gray-900 [&_.cl-formFieldInput]:dark:!text-white 
                            [&_.cl-formFieldInput]:!py-3 [&_.cl-formFieldInput]:!rounded-xl
                            [&_.cl-footerActionLink]:!text-primary 
                            [&_.cl-formButtonPrimary]:!bg-primary [&_.cl-formButtonPrimary]:!shadow-none [&_.cl-formButtonPrimary]:!py-3 [&_.cl-formButtonPrimary]:!text-base
                        ">
                            <UserProfile 
                                routing="hash"
                                appearance={{
                                    elements: {
                                        navbar: "hidden", 
                                        scrollBox: "rounded-none",
                                        pageScrollBox: "p-0"
                                    },
                                }}
                            />
                        </div>
                    </div>
                    )}

                    {/* 4. WISHLIST TAB */}
                    {activeTab === 'wishlist' && (
                        <div className="p-8 md:p-10 flex flex-col items-center justify-center min-h-[500px] text-center">
                            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                                <Heart className="w-12 h-12 text-rose-500 fill-rose-500/20" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Your Wishlist</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg">
                                Items you love will be saved here. <br/>Save them now, buy them later.
                            </p>
                        </div>
                    )}
                    
                </div>
            </main>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;

