import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Warehouse, Bot, Shield, Settings } from 'lucide-react';

const mainNavItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/users', label: 'Users', icon: Users },
];

const moreNavItems = [
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/admin/ai', label: 'AI Assistant', icon: Bot },
  { to: '/admin/security', label: 'Security', icon: Shield },
  { to: '/admin/login-control', label: 'Login Control', icon: Settings },
];

const AdminBottomNav: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const isMoreActive = moreNavItems.some(item => location.pathname === item.to);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-center justify-around h-16 px-2">
        {mainNavItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              isActive(to)
                ? 'text-orange-500'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
        
        <DropdownMenu>
          <DropdownMenuTrigger className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
            isMoreActive ? 'text-orange-500' : 'text-gray-500 hover:text-white'
          }`}>
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            side="top"
            className="bg-[#1a1a1a] border-white/10 mb-2"
          >
            {moreNavItems.map(({ to, label, icon: Icon }) => (
              <DropdownMenuItem key={to} asChild>
                <Link 
                  to={to}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${
                    isActive(to) ? 'text-orange-500' : 'text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default AdminBottomNav;
