import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sun, Moon, Home, Package, MapPin, LogIn, Settings, X, User, LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import gsap from 'gsap';

// --- STYLES (Preserving your Neon & Brand style) ---
const styles = `
  .brand-font { font-family: 'Orbitron', sans-serif; font-weight: 900; letter-spacing: 0.1em; }
  .romeo-signature {
    background: linear-gradient(to right, #FFD700, #FF8C00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 0.6rem;
    font-weight: 800;
  }
  .nav-dark { background: #000000; color: white; border-bottom-left-radius: 30px; border-bottom-right-radius: 30px; }
  .search-pill { background: rgba(255, 255, 255, 0.1); border-radius: 999px; transition: all 0.3s ease; }
  .search-pill:focus-within { background: rgba(255, 255, 255, 0.2); width: 100%; }
`;

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <style>{styles}</style>
      
      <header className="fixed top-0 left-0 right-0 z-50 h-24 nav-dark px-6 flex flex-col justify-center shadow-2xl">
        <div className="container mx-auto flex items-center justify-between gap-4">
          
          {/* SEARCH BAR (As seen in your image) */}
          <div className="flex-1 max-w-md relative group">
            <div className="search-pill flex items-center px-4 py-2 border border-white/10">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search" 
                className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 text-sm"
              />
            </div>
          </div>

          {/* AVATAR & DROPDOWN SECTION */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full border-2 border-pink-500 overflow-hidden hover:scale-110 transition-transform active:scale-95"
            >
              <img 
                src={user?.avatar || "https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80"} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </button>

            {/* THE DROPDOWN MENU (Sikhaya hua logic) */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#121212] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Basit Romeo</p>
                  <p className="text-xs text-gray-500">basit@mirae.com</p>
                  <div className="romeo-signature mt-1 uppercase">Dev Mode Active</div>
                </div>

                <div className="p-2">
                  <DropdownItem icon={User} label="View Profile" />
                  <DropdownItem icon={Settings} label="Settings" />
                  <DropdownItem icon={Heart} label="Wishlist" />
                  
                  <div className="my-1 border-t dark:border-white/5" />
                  
                  {/* Theme Toggle inside Dropdown */}
                  <button 
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                      <span className="text-sm font-medium dark:text-gray-200">Theme</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative ${theme === 'light' ? 'bg-gray-300' : 'bg-yellow-600'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${theme === 'light' ? 'left-1' : 'left-4'}`} />
                    </div>
                  </button>

                  <DropdownItem icon={LogOut} label="Logout" variant="danger" />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spacer to push content below fixed header */}
      <div className="h-24"></div>
    </>
  );
};

// Helper Component for Menu Items
const DropdownItem = ({ icon: Icon, label, variant = "default" }) => (
  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
    variant === 'danger' ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
  }`}>
    <Icon className="w-4 h-4" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default Header;
