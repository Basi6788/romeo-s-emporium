import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, Link } from "react-router-dom";
import { ReactLenis } from "lenis/react";
import { ClerkProvider, AuthenticateWithRedirectCallback } from "@clerk/clerk-react"; 
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

// Pages imports
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

// Admin Pages
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

// 🔥 APNI KEY CHECK KARO (Environment variable se uthana behtar hai, lakin ye bhi chalega)
const PUBLISHABLE_KEY = "pk_test_cHJvbXB0LXR1cmtleS03Ni5jbGVyay5hY2NvdW50cy5kZXYk"; 

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading, isAuthenticated } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // 🔥 Handle Clerk Redirects properly
  if (location.pathname.includes('/sso-callback') || location.pathname.includes('/auth/callback')) {
     return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
           <AuthenticateWithRedirectCallback 
              signInForceRedirectUrl="/"
              signUpForceRedirectUrl="/"
           />
        </div>
     );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] w-full overflow-x-hidden relative bg-background">
      <main className="flex-1 w-full">
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            
            {/* 🔥 IMPORTANT: Wildcard route for nested auth pages (sign-in/sign-up) */}
            <Route path="/auth/*" element={<AuthPage />} />
            
            <Route path="/mepco-bill" element={<MepcoBill />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/ai" element={<AdminRoute><AdminAI /></AdminRoute>} />
            <Route path="/admin/security" element={<AdminRoute><AdminSecurity /></AdminRoute>} />
            <Route path="/admin/login-control" element={<AdminRoute><AdminLoginControl /></AdminRoute>} />
            <Route path="/admin/inventory" element={<AdminRoute><AdminInventory /></AdminRoute>} />

            {/* Catch All */}
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

const App = () => (
  <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY}
    // 👇 FIXED: Exact paths taake Clerk confuse na ho
    signInUrl="/auth/sign-in"
    signUpUrl="/auth/sign-up"
    signInForceRedirectUrl="/"
    signUpForceRedirectUrl="/"
    afterSignOutUrl="/"
  >
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  {/* Lenis Smooth Scroll Setup */}
                  <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                      <ScrollToTop />
                      <AnimatedRoutes />
                    </BrowserRouter>
                  </ReactLenis>
                </TooltipProvider>
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
