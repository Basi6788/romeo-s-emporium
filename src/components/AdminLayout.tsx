import React, { useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Users, ShoppingCart, Shield, Bot, 
  LogOut, Settings, Menu, X, Search, ChevronRight, Warehouse, Loader2 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminNotifications from './AdminNotifications';
import AdminBottomNav from './AdminBottomNav';
import gsap from 'gsap';

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // GSAP Animation for Page Transitions
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [location.pathname]);

  // Logout function optimized
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Jab tak AuthContext loading hai, spinner dikhao
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
        <p className="text-gray-500 text-sm animate-pulse">Syncing Admin Panel...</p>
      </div>
    );
  }

  // Agar user admin nahi hai, to layout render hi mat karo (App.tsx ka Guard handle karega redirection)
  if (!isAdmin) return null;

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/ai', label: 'AI Assistant', icon: Bot },
    { to: '/admin/security', label: 'Security', icon: Shield },
    { to: '/admin/login-control', label: 'Login Control', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 
        bg-[#0f0f0f] border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-black group-hover:scale-110 transition-transform">B</div>
            <span className="text-xl font-bold tracking-tight">
              Basit<span className="text-orange-500">Shop</span>
            </span>
          </Link>
        </div>

        <nav className="p-4 space-y-1 h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200 group
                  ${isActive 
                    ? 'bg-orange-500/10 text-orange-500' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'group-hover:text-orange-400'}`} />
                <span className="font-medium text-sm">{label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-[#0a0a0a]">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-xs font-bold border border-orange-500/30">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-gray-200">{user?.email}</p>
              <p className="text-[10px] text-orange-500/70 uppercase tracking-wider font-bold">Admin Panel</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> 
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 flex items-center px-4 lg:px-8 justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden md:block relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Quick search..." 
                className="w-full pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>
          <AdminNotifications />
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div ref={contentRef}>
            {children || <Outlet />}
          </div>
        </main>
      </div>

      <AdminBottomNav />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-40" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default AdminLayout;
