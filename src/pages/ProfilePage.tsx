import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  User,
  Mail,
  LogOut,
  Package,
  Heart,
  Camera,
  ShieldCheck,
  Loader2,
  Smartphone,
  Laptop,
  Trash2,
  Shield,
  Clock,
  Globe,
  Check,
  Lock,
  Key,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShoppingBag,
  X,
  CheckCircle,
  UserCircle
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useUser, useClerk } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';

// Supabase Client Setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to format date
const formatDate = (date: Date | string | number) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

// Device detection logic
interface DeviceDetails {
  os: string;
  browser: string;
  browserVersion: string;
  deviceType: string;
  deviceModel: string;
}

const getDeviceDetails = (userAgent: string): DeviceDetails => {
  let os = 'Unknown OS';
  if (userAgent.indexOf("Win") !== -1) os = "Windows";
  if (userAgent.indexOf("Mac") !== -1) os = "MacOS";
  if (userAgent.indexOf("Linux") !== -1) os = "Linux";
  if (userAgent.indexOf("Android") !== -1) os = "Android";
  if (userAgent.indexOf("iPhone") !== -1) os = "iOS";

  let browser = 'Unknown Browser';  
  let browserVersion = '';  
  
  if (userAgent.indexOf("Chrome") !== -1) {  
    browser = "Chrome";  
    const match = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);  
    if (match) browserVersion = match[1];  
  } else if (userAgent.indexOf("Firefox") !== -1) {  
    browser = "Firefox";  
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);  
    if (match) browserVersion = match[1];  
  } else if (userAgent.indexOf("Safari") !== -1) {  
    browser = "Safari";  
    const match = userAgent.match(/Version\/(\d+\.\d+)/);  
    if (match) browserVersion = match[1];  
  } else if (userAgent.indexOf("Edge") !== -1) {  
    browser = "Edge";  
  }  

  const isMobile = /Mobi|Android|iPhone/i.test(userAgent);  
  
  return {  
    os,  
    browser,  
    browserVersion,  
    deviceType: isMobile ? 'mobile' : 'desktop',  
    deviceModel: isMobile ? 'Mobile Device' : 'PC',  
  };
};

const getDeviceIcon = (deviceType: string, deviceName?: string) => {
  if (deviceType === 'mobile' || deviceName?.toLowerCase().includes('iphone') || deviceName?.toLowerCase().includes('android')) {
    return Smartphone;
  }
  return Laptop;
};

// Username suggestion generator
const generateUsernameSuggestions = (base: string): string[] => {
  if (!base.trim()) return [];

  const baseName = base.toLowerCase().replace(/\s+/g, '');  
  const suggestions = new Set<string>();  
  
  // Basic variations  
  suggestions.add(baseName);  
  suggestions.add(`${baseName}${Math.floor(Math.random() * 1000)}`);  
  suggestions.add(`${baseName}_${Math.floor(Math.random() * 100)}`);  
  suggestions.add(`${baseName}${Date.now().toString().slice(-3)}`);  
  
  // Add some common variations  
  const adjectives = ['cool', 'pro', 'master', 'legend', 'prime', 'elite', 'vibe'];  
  adjectives.forEach(adj => {  
    suggestions.add(`${baseName}_${adj}`);  
    suggestions.add(`${adj}_${baseName}`);  
  });  
  
  return Array.from(suggestions).slice(0, 6);
};

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: string;
  items_count: number;
  payment_method: string;
  shipping_address: {
    city: string;
  };
}

interface WishlistItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

const ProfilePage: React.FC = () => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');  
  const [loading, setLoading] = useState(false);  
  const [saving, setSaving] = useState(false);  
  const [orders, setOrders] = useState<Order[]>([]);  
  const [ordersLoading, setOrdersLoading] = useState(true);  
  
  // Profile Form Data  
  const [formData, setFormData] = useState<FormData>({   
    firstName: '',   
    lastName: '',   
    username: ''   
  });  
  
  // Username States  
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);  
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);  
  const [checkingUsername, setCheckingUsername] = useState(false);  
  const usernameTimeoutRef = useRef<NodeJS.Timeout>();  
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({  
    security: true,  
    devices: true,  
    deleteAccount: false  
  });  

  // Load initial data  
  useEffect(() => {  
    if (clerkUser) {  
      setFormData({  
        firstName: clerkUser.firstName || '',  
        lastName: clerkUser.lastName || '',  
        username: clerkUser.username || ''  
      });  
        
      // Load orders from Supabase  
      loadOrders();  
    }  
  }, [clerkUser]);  

  // Load orders from Supabase  
  const loadOrders = async () => {  
    if (!clerkUser?.id) return;  
      
    setOrdersLoading(true);  
    try {  
      const { data, error } = await supabase  
        .from('orders')  
        .select('*')  
        .eq('user_id', clerkUser.id)  
        .order('created_at', { ascending: false });  
        
      if (error) throw error;  
        
      setOrders(data || []);  
    } catch (error) {  
      console.error('Error loading orders:', error);  
      toast.error('Failed to load orders');  
    } finally {  
      setOrdersLoading(false);  
    }  
  };  

  // Check username availability in Clerk  
  const checkUsernameAvailability = async (username: string) => {  
    if (!username || username.length < 3) {  
      setUsernameAvailable(null);  
      setUsernameSuggestions([]);  
      return;  
    }  

    setCheckingUsername(true);  
    try {  
      // In a real app, you would call your backend to check username availability  
      // For now, simulate with a timeout  
      await new Promise(resolve => setTimeout(resolve, 500));  
        
      // Simulate checking - in reality, integrate with Clerk's API  
      const isAvailable = Math.random() > 0.5; // Simulated result  
      setUsernameAvailable(isAvailable);  
        
      if (!isAvailable) {  
        setUsernameSuggestions(generateUsernameSuggestions(username));  
      } else {  
        setUsernameSuggestions([]);  
      }  
    } catch (error) {  
      console.error('Error checking username:', error);  
      toast.error('Failed to check username availability');  
    } finally {  
      setCheckingUsername(false);  
    }  
  };  

  // Handle username input with debounce  
  const handleUsernameChange = (username: string) => {  
    setFormData(prev => ({ ...prev, username }));  
    setUsernameAvailable(null);  
      
    // Clear previous timeout  
    if (usernameTimeoutRef.current) {  
      clearTimeout(usernameTimeoutRef.current);  
    }  
      
    // Set new timeout for debounce  
    usernameTimeoutRef.current = setTimeout(() => {  
      checkUsernameAvailability(username);  
    }, 500);  
  };  

  // Handle suggestion click  
  const handleSuggestionClick = (suggestion: string) => {  
    setFormData(prev => ({ ...prev, username: suggestion }));  
    checkUsernameAvailability(suggestion);  
  };  

  const toggleSection = (section: string) => {  
    setExpandedSections(prev => ({  
      ...prev,  
      [section]: !prev[section]  
    }));  
  };  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {  
    const { name, value } = e.target;  
      
    if (name === 'username') {  
      handleUsernameChange(value);  
    } else {  
      setFormData(prev => ({ ...prev, [name]: value }));  
    }  
  };  

  // Simple logout without OTP
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout Error', error);
      toast.error('Logout failed');
    }
  };

  // Update profile with Clerk  
  const handleSaveProfile = async () => {  
    if (!clerkUser) return;  
      
    if (formData.username && usernameAvailable === false) {  
      toast.error('Please choose an available username');  
      return;  
    }  

    setSaving(true);  
    try {  
      const updateData: any = {  
        firstName: formData.firstName,  
        lastName: formData.lastName,  
      };  
        
      // Only update username if it's changed and available  
      if (formData.username !== clerkUser.username && formData.username) {  
        updateData.username = formData.username;  
      }  
        
      await clerkUser.update(updateData);  
      toast.success('Profile updated successfully!');  
    } catch (error: any) {  
      console.error(error);  
      toast.error(error.errors?.[0]?.message || 'Failed to update profile');  
    } finally {  
      setSaving(false);  
    }  
  };  

  // Image upload  
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

  // Revoke session  
  const handleRevokeSession = async (sessionId: string) => {  
    try {  
      const session = clerkUser?.sessions.find(s => s.id === sessionId);  
      if (session) {  
        await session.revoke();  
        toast.success("Device logged out successfully");  
      }  
    } catch (error) {  
      toast.error("Failed to revoke session");  
    }  
  };  

  // Format order status  
  const getOrderStatusBadge = (status: string) => {  
    const statusConfig: Record<string, { color: string; bg: string }> = {  
      'pending': { color: 'text-yellow-500', bg: 'bg-yellow-500/10' },  
      'processing': { color: 'text-blue-500', bg: 'bg-blue-500/10' },  
      'shipped': { color: 'text-purple-500', bg: 'bg-purple-500/10' },  
      'delivered': { color: 'text-emerald-500', bg: 'bg-emerald-500/10' },  
      'cancelled': { color: 'text-rose-500', bg: 'bg-rose-500/10' },  
    };  
      
    const config = statusConfig[status] || { color: 'text-gray-500', bg: 'bg-gray-500/10' };  
      
    return (  
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>  
        {status.charAt(0).toUpperCase() + status.slice(1)}  
      </span>  
    );  
  };  

  if (authLoading || !clerkLoaded) {  
    return (  
      <Layout>  
        <div className="min-h-screen flex items-center justify-center">  
          <Loader2 className="w-10 h-10 animate-spin text-primary" />  
        </div>  
      </Layout>  
    );  
  }  

  if (!isAuthenticated && !clerkUser) {  
    return <Navigate to="/auth/sign-in" replace />;  
  }  

  const tabs = [  
    { id: 'profile', label: 'Personal Info', icon: User },  
    { id: 'orders', label: 'My Orders', icon: Package },  
    { id: 'wishlist', label: 'Wishlist', icon: Heart },  
    { id: 'security', label: 'Security', icon: Shield },  
  ];  

  return (  
    <Layout>  
      <div className="min-h-screen w-full bg-white dark:bg-black/95 text-gray-900 dark:text-white transition-colors duration-200">  
        {/* Background Gradients - Light & Dark mode */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">  
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-[128px] opacity-30 dark:opacity-30" />  
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[128px] opacity-30 dark:opacity-20" />  
        </div>  

        <div className="container mx-auto px-4 py-8 max-w-6xl">  
          {/* Header */}  
          <div className="mb-8 p-6 flex flex-col md:flex-row md:items-center justify-between backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl gap-4">  
            <div>  
              <h1 className="text-3xl font-bold font-display dark:text-white">Account Settings</h1>  
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your profile and security preferences</p>  
            </div>  
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">  
              <ShieldCheck className="w-5 h-5 text-emerald-500" />  
              <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Secure Connection</span>  
            </div>  
          </div>  

          <div className="flex flex-col lg:flex-row gap-8">  
            {/* --- SIDEBAR --- */}  
            <aside className="lg:w-72 shrink-0">  
              <div className="p-6 sticky top-24 backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl">  
                {/* Avatar */}  
                <div className="text-center mb-8 relative group">  
                  <div className="relative w-28 h-28 mx-auto mb-4">  
                    <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-violet-500 rounded-full blur opacity-20 dark:opacity-30 group-hover:opacity-40 transition duration-500"></div>  
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-gray-200 dark:border-white/20">  
                      <img   
                        src={clerkUser?.imageUrl}   
                        alt="Profile"   
                        className="w-full h-full object-cover"   
                      />  
                    </div>  
                    <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/80 transition-all shadow-lg hover:scale-110 z-20">  
                      <Camera className="w-4 h-4" />  
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />  
                    </label>  
                  </div>  

                  <h2 className="font-bold text-lg font-display dark:text-white">{clerkUser?.fullName || 'User'}</h2>  
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate px-2">  
                    {clerkUser?.username ? `@${clerkUser.username}` : 'No username set'}  
                  </p>  
                </div>  

                {/* Navigation Tabs */}  
                <nav className="space-y-2">  
                  {tabs.map(({ id, label, icon: Icon }) => (  
                    <button  
                      key={id}  
                      onClick={() => setActiveTab(id)}  
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-sm ${  
                        activeTab === id  
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'  
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'  
                      }`}  
                    >  
                      <Icon className={`w-5 h-5 ${activeTab === id ? 'fill-current opacity-100' : 'opacity-70'}`} />  
                      {label}  
                    </button>  
                  ))}  
                    
                  <div className="h-px bg-gray-200 dark:bg-white/10 my-4" />  
                    
                  <button  
                    onClick={handleLogout}  
                    disabled={loading}  
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors group text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"  
                  >  
                    {loading ? (  
                      <Loader2 className="w-5 h-5 animate-spin" />  
                    ) : (  
                      <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />  
                    )}  
                    {loading ? 'Signing out...' : 'Sign Out'}  
                  </button>  
                </nav>  
              </div>  
            </aside>  

            {/* --- MAIN CONTENT --- */}  
            <main className="flex-1 min-w-0">  
              {/* 1. PERSONAL INFO TAB */}  
              {activeTab === 'profile' && (  
                <div className="p-8 animate-in fade-in zoom-in-95 duration-300 backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl">  
                  <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-white/10 pb-4">  
                    <h2 className="text-xl font-bold font-display dark:text-white">Personal Information</h2>  
                    <span className="hidden sm:block text-xs text-gray-500 font-mono">  
                      ID: {clerkUser?.id}  
                    </span>  
                  </div>  

                  <div className="grid md:grid-cols-2 gap-6">  
                    <div className="space-y-2">  
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">First Name</label>  
                      <div className="relative group">  
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />  
                        <input  
                          type="text"  
                          name="firstName"  
                          value={formData.firstName}  
                          onChange={handleChange}  
                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all focus:bg-white dark:focus:bg-black/60"  
                          placeholder="Enter first name"  
                        />  
                      </div>  
                    </div>  

                    <div className="space-y-2">  
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Name</label>  
                      <div className="relative group">  
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />  
                        <input  
                          type="text"  
                          name="lastName"  
                          value={formData.lastName}  
                          onChange={handleChange}  
                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all focus:bg-white dark:focus:bg-black/60"  
                          placeholder="Enter last name"  
                        />  
                      </div>  
                    </div>  

                    <div className="space-y-2 md:col-span-2">  
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Username</label>  
                      <div className="relative group">  
                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />  
                        <input  
                          type="text"  
                          name="username"  
                          value={formData.username}  
                          onChange={handleChange}  
                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all focus:bg-white dark:focus:bg-black/60"  
                          placeholder="Choose a username"  
                        />  
                        {checkingUsername && (  
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">  
                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />  
                          </div>  
                        )}  
                        {usernameAvailable !== null && !checkingUsername && (  
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">  
                            {usernameAvailable ? (  
                              <CheckCircle className="w-5 h-5 text-emerald-500" />  
                            ) : (  
                              <X className="w-5 h-5 text-rose-500" />  
                            )}  
                          </div>  
                        )}  
                      </div>  
                        
                      {/* Username Status Message */}  
                      {checkingUsername && (  
                        <p className="text-sm text-gray-500 dark:text-gray-400">Checking availability...</p>  
                      )}  
                        
                      {usernameAvailable === false && (  
                        <div className="space-y-2">  
                          <p className="text-sm text-rose-500">Username already taken</p>  
                            
                          {/* Suggestions */}  
                          {usernameSuggestions.length > 0 && (  
                            <div>  
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Try these suggestions:</p>  
                              <div className="flex flex-wrap gap-2">  
                                {usernameSuggestions.map((suggestion) => (  
                                  <button  
                                    key={suggestion}  
                                    onClick={() => handleSuggestionClick(suggestion)}  
                                    className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"  
                                  >  
                                    {suggestion}  
                                  </button>  
                                ))}  
                              </div>  
                            </div>  
                          )}  
                        </div>  
                      )}  
                        
                      {usernameAvailable === true && (  
                        <p className="text-sm text-emerald-500">Username available!</p>  
                      )}  
                    </div>  

                    <div className="space-y-2 md:col-span-2">  
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email Address</label>  
                      <div className="relative">  
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />  
                        <input  
                          type="email"  
                          value={clerkUser?.primaryEmailAddress?.emailAddress || ''}  
                          disabled  
                          className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl py-3 pl-11 pr-4 text-gray-500 dark:text-gray-400 cursor-not-allowed"  
                        />  
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">  
                          <span className="text-xs text-emerald-500 hidden sm:inline">Verified</span>  
                          <Check className="w-4 h-4 text-emerald-500" />  
                        </div>  
                      </div>  
                    </div>  
                  </div>  

                  <div className="mt-10 flex justify-end">  
                    <button   
                      onClick={handleSaveProfile}   
                      disabled={saving || (formData.username && usernameAvailable === false)}   
                      className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"  
                    >  
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}  
                    </button>  
                  </div>  
                </div>  
              )}  

              {/* 2. ORDERS TAB (From Supabase) */}  
              {activeTab === 'orders' && (  
                <div className="animate-in fade-in zoom-in-95 duration-300">  
                  <div className="backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">  
                    <div className="p-8 border-b border-gray-200 dark:border-white/10">  
                      <h2 className="text-2xl font-bold font-display dark:text-white mb-2">My Orders</h2>  
                      <p className="text-gray-600 dark:text-gray-400">Track and manage your orders</p>  
                    </div>  

                    <div className="p-8">  
                      {ordersLoading ? (  
                        <div className="flex justify-center py-12">  
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />  
                        </div>  
                      ) : orders.length === 0 ? (  
                        <div className="text-center py-12">  
                          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />  
                          <h3 className="text-xl font-bold mb-2 dark:text-white">No Orders Yet</h3>  
                          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-8">  
                            Looks like you haven't placed any orders yet.  
                          </p>  
                          <button   
                            onClick={() => navigate('/products')}   
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"  
                          >  
                            Start Shopping  
                          </button>  
                        </div>  
                      ) : (  
                        <div className="space-y-4">  
                          {orders.map((order) => (  
                            <div   
                              key={order.id}   
                              className="p-6 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl hover:border-gray-300 dark:hover:border-white/20 transition-colors"  
                            >  
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">  
                                <div>  
                                  <h4 className="font-bold text-lg dark:text-white">Order #{order.order_number}</h4>  
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">  
                                    Placed on {new Date(order.created_at).toLocaleDateString()}  
                                  </p>  
                                </div>  
                                <div className="flex items-center gap-4">  
                                  {getOrderStatusBadge(order.status)}  
                                  <span className="font-bold text-lg dark:text-white">  
                                    ${parseFloat(order.total_amount).toFixed(2)}  
                                  </span>  
                                </div>  
                              </div>  
                                
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">  
                                <div>  
                                  <p className="text-gray-500 dark:text-gray-400 mb-1">Items</p>  
                                  <p className="font-medium dark:text-white">{order.items_count} items</p>  
                                </div>  
                                <div>  
                                  <p className="text-gray-500 dark:text-gray-400 mb-1">Payment</p>  
                                  <p className="font-medium dark:text-white capitalize">{order.payment_method}</p>  
                                </div>  
                                <div>  
                                  <p className="text-gray-500 dark:text-gray-400 mb-1">Delivery</p>  
                                  <p className="font-medium dark:text-white">{order.shipping_address?.city || 'N/A'}</p>  
                                </div>  
                              </div>  
                                
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">  
                                <button   
                                  onClick={() => navigate(`/orders/${order.id}`)}  
                                  className="text-primary hover:text-primary/80 font-medium text-sm"  
                                >  
                                  View Order Details →  
                                </button>  
                              </div>  
                            </div>  
                          ))}  
                        </div>  
                      )}  
                    </div>  
                  </div>  
                </div>  
              )}  

              {/* 3. WISHLIST TAB (Using WishContext) */}  
              {activeTab === 'wishlist' && (  
                <div className="animate-in fade-in zoom-in-95 duration-300">  
                  <div className="backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">  
                    <div className="p-8 border-b border-gray-200 dark:border-white/10">  
                      <h2 className="text-2xl font-bold font-display dark:text-white mb-2">My Wishlist</h2>  
                      <p className="text-gray-600 dark:text-gray-400">Items you've saved for later</p>  
                    </div>  

                    <div className="p-8">  
                      {wishlist.length === 0 ? (  
                        <div className="text-center py-12">  
                          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" />  
                          <h3 className="text-xl font-bold mb-2 dark:text-white">Your Wishlist is Empty</h3>  
                          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-8">  
                            Save items you want to buy later here.  
                          </p>  
                          <button   
                            onClick={() => navigate('/products')}   
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"  
                          >  
                            Browse Products  
                          </button>  
                        </div>  
                      ) : (  
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">  
                          {wishlist.map((item: WishlistItem) => (  
                            <div   
                              key={item.id}   
                              className="group bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden hover:border-gray-300 dark:hover:border-white/20 transition-all"  
                            >  
                              <div className="relative h-48 overflow-hidden">  
                                <img   
                                  src={item.image}   
                                  alt={item.name}  
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"  
                                />  
                                <button  
                                  onClick={() => removeFromWishlist(item.id)}  
                                  className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"  
                                >  
                                  <X className="w-4 h-4" />  
                                </button>  
                              </div>  
                                
                              <div className="p-4">  
                                <h4 className="font-bold dark:text-white mb-2 line-clamp-1">{item.name}</h4>  
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">  
                                  {item.description}  
                                </p>  
                                  
                                <div className="flex items-center justify-between">  
                                  <span className="font-bold text-lg dark:text-white">  
                                    ${item.price}  
                                  </span>  
                                  <button  
                                    onClick={() => navigate(`/products/${item.id}`)}  
                                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"  
                                  >  
                                    View Product  
                                  </button>  
                                </div>  
                              </div>  
                            </div>  
                          ))}  
                        </div>  
                      )}  
                    </div>  
                  </div>  
                </div>  
              )}  

              {/* 4. SECURITY & DEVICES TAB */}  
              {activeTab === 'security' && (  
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">  
                  <div className="backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">  
                    {/* Header */}  
                    <div className="p-8 border-b border-gray-200 dark:border-white/10">  
                      <h2 className="text-2xl font-bold font-display dark:text-white mb-2">Security Settings</h2>  
                      <p className="text-gray-600 dark:text-gray-400">Manage your password and active sessions</p>  
                    </div>  

                    {/* Active Devices Section */}  
                    <div className="p-8 border-b border-gray-200 dark:border-white/10">  
                      <button   
                        onClick={() => toggleSection('devices')}  
                        className="w-full flex items-center justify-between mb-4"  
                      >  
                        <h3 className="text-lg font-medium dark:text-white">Active devices</h3>  
                        {expandedSections.devices ?   
                          <ChevronUp className="w-5 h-5 text-gray-500" /> :   
                          <ChevronDown className="w-5 h-5 text-gray-500" />  
                        }  
                      </button>  
                        
                      {expandedSections.devices && (  
                        <div className="space-y-4 animate-in slide-in-from-top-5">  
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">  
                            Manage devices where you're currently logged in.  
                          </p>  
                            
                          <div className="space-y-3">  
                            {clerkUser?.sessions?.map((session) => {  
                              const deviceDetails = getDeviceDetails(session.latestActivity.userAgent || '');  
                              const DeviceIcon = getDeviceIcon(deviceDetails.deviceType, deviceDetails.deviceModel);  
                              const isCurrent = session.id === useClerk().session?.id;  
                              const browserInfo = deviceDetails.browserVersion ?   
                                `${deviceDetails.browser} ${deviceDetails.browserVersion}` :   
                                deviceDetails.browser;  
                                
                              return (  
                                <div key={session.id} className="flex items-start p-4 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl hover:border-gray-300 dark:hover:border-white/20 transition-colors group">  
                                  <div className="flex items-start gap-4 flex-1">  
                                    <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl mt-1">  
                                      <DeviceIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />  
                                    </div>  
                                    <div className="flex-1 min-w-0">  
                                      <div className="flex flex-wrap items-center gap-2 mb-1">  
                                        <h4 className="font-bold dark:text-white text-sm truncate">  
                                          {deviceDetails.os} <span className="text-gray-500 font-normal">via {browserInfo}</span>  
                                        </h4>  
                                        {isCurrent && (  
                                          <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold uppercase rounded border border-primary/20 whitespace-nowrap">  
                                            Current Session  
                                          </span>  
                                        )}  
                                      </div>  
                                      <div className="space-y-1.5">  
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">  
                                          <span className="flex items-center gap-1.5 font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-[10px]">  
                                            <Globe className="w-3 h-3" />  
                                            {session.latestActivity.ipAddress || 'IP Hidden'}  
                                          </span>  
                                          {session.latestActivity.city && (  
                                            <span className="text-gray-500">  
                                              {session.latestActivity.city}, {session.latestActivity.country}  
                                            </span>  
                                          )}  
                                        </div>  
                                        <div className="flex items-center gap-2 text-xs text-gray-500">  
                                          <Clock className="w-3 h-3" />  
                                          <span>  
                                            Active: {formatDate(session.lastActiveAt)}  
                                          </span>  
                                        </div>  
                                      </div>  
                                    </div>  
                                  </div>  
                                  {!isCurrent && (  
                                    <button   
                                      onClick={() => handleRevokeSession(session.id)}  
                                      className="p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"  
                                      title="Logout this device"  
                                    >  
                                      <Trash2 className="w-4 h-4" />  
                                    </button>  
                                  )}  
                                </div>  
                              );  
                            })}  
                          </div>  
                        </div>  
                      )}  
                    </div>  

                    {/* Delete Account Section */}  
                    <div className="p-8">  
                      <button   
                        onClick={() => toggleSection('deleteAccount')}  
                        className="w-full flex items-center justify-between mb-4"  
                      >  
                        <h3 className="text-lg font-medium text-rose-500">Danger Zone</h3>  
                        {expandedSections.deleteAccount ?   
                          <ChevronUp className="w-5 h-5 text-rose-500/50" /> :   
                          <ChevronDown className="w-5 h-5 text-rose-500/50" />  
                        }  
                      </button>  
                        
                      {expandedSections.deleteAccount && (  
                        <div className="animate-in slide-in-from-top-5">  
                          <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center justify-between">  
                            <div>  
                              <h4 className="font-medium text-rose-500 mb-1">Delete Account</h4>  
                              <p className="text-sm text-gray-600 dark:text-gray-400">  
                                Permanently delete your account and all data.  
                              </p>  
                            </div>  
                            <button   
                              onClick={() => useClerk().openUserProfile({ section: "danger" })}   
                              className="px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-colors text-sm font-medium"  
                            >  
                              Delete  
                            </button>  
                          </div>  
                        </div>  
                      )}  
                    </div>  
                  </div>  
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
