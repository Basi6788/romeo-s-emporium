import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, Link, useNavigate } from "react-router-dom";
import { ReactLenis } from "lenis/react";
// Clerk Imports
import { ClerkProvider } from "@clerk/clerk-react"; // Note: AuthenticateWithRedirectCallback yahan se hata diya kyun ke ab SSOCallback page me hai
// Context Imports
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { ShieldCheck, Loader2 } from "lucide-react";

import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";
import BottomNavigation from "@/components/BottomNavigation";
import CompareBar from "@/components/CompareBar";
import CompareModal from "@/components/CompareModal";

// Pages Imports
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import MepcoBill from "./pages/MepcoBill";
import HelpCenter from "./pages/HelpCenter";

// 👇 NEW IMPORT (Make sure to create the file first)
import SSOCallback from "./pages/SSOCallback"; 

// Admin Imports... (Same as yours)
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAI from "./pages/admin/AdminAI";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminLoginControl from "./pages/admin/AdminLoginControl";
import AdminInventory from "./pages/admin/AdminInventory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const PUBLISHABLE_KEY = "pk_test_cHJvbXB0LXR1cmtleS03Ni5jbGVyay5hY2NvdW50cy5kZXYk"; 

// --- Protected Route Components ---
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  }
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  
  return <>{children}</>;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// --- Helper Component to bridge Clerk & Router ---
const ClerkRouterBridge = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
};

const MainContent = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-[100dvh] w-full overflow-x-hidden relative bg-background">
      <main className="flex-1 w-full">
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/mepco-bill" element={<MepcoBill />} />
            <Route path="/help" element={<HelpCenter />} />

            {/* 🔥 UPDATED: Clerk SSO Callback Handler with Custom UI */}
            {/* Ab ye hamara naya Custom Page use karega */}
            <Route 
              path="/sso-callback" 
              element={<SSOCallback />} 
            />

            {/* 🔥 Auth Routes for Custom UI */}
            <Route path="/auth/sign-in/*" element={<GuestRoute><AuthPage /></GuestRoute>} />
            <Route path="/auth/sign-up/*" element={<GuestRoute><AuthPage /></GuestRoute>} />
            
            <Route path="/auth" element={<Navigate to="/auth/sign-in" replace />} />

            {/* Protected User Routes */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/ai" element={<AdminRoute><AdminAI /></AdminRoute>} />
            <Route path="/admin/security" element={<AdminRoute><AdminSecurity /></AdminRoute>} />
            <Route path="/admin/login-control" element={<AdminRoute><AdminLoginControl /></AdminRoute>} />
            <Route path="/admin/inventory" element={<AdminRoute><AdminInventory /></AdminRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </main>

      {isAdmin && !isAdminRoute && (
        <div className="fixed bottom-24 right-4 z-50">
          <Link to="/admin" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" /> Admin Panel
          </Link>
        </div>
      )}

      {!isAdminRoute && (
        <>
          <BottomNavigation />
          <CompareBar />
          <CompareModal />
          <div className="h-[80px] w-full md:hidden" aria-hidden="true" />
        </>
      )}
    </div>
  );
};

// Main App Component
const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ClerkRouterBridge>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <CompareProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
                      <ScrollToTop />
                      <MainContent />
                    </ReactLenis>
                  </TooltipProvider>
                </CompareProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkRouterBridge>
  </BrowserRouter>
);

export default App;
