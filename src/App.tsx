import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, Link, useNavigate } from "react-router-dom";
import { ReactLenis } from "lenis/react";
import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/clerk-react"; 
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

// Pages
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
import SSOCallback from "./pages/SSOCallback"; 
// 👇 YAHAN MAINE IMPORT ADD KIYA HAI (Path check kar lena agar different folder mein ho)
import WelcomeBackPage from "./pages/WelcomeBackPage"; 

// Admin
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

// --- Protected Route (Modified: Sirf Auth Check karega, Onboarding nahi) ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to={`/auth/sign-in?redirect_url=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

// --- Admin Route ---
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading, isAuthenticated } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/auth/sign-in" replace />;
  
  return <>{children}</>;
};

// --- Clerk Bridge ---
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

// Main Content
const MainContent = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-[100dvh] w-full overflow-x-hidden relative bg-background">
      
      <main className="flex-1 w-full relative z-10">
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/mepco-bill" element={<MepcoBill />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/sso-callback" element={<SSOCallback />} />
            
            {/* 👇 YAHAN ROUTE ADD KIYA HAI. URL /welcome-back hoga */}
            <Route path="/welcome-back" element={<WelcomeBackPage />} />

            {/* Auth Routes */}
            <Route path="/auth/sign-in/*" element={<AuthPage />} />
            <Route path="/auth/sign-up/*" element={<AuthPage />} />
            <Route path="/auth" element={<Navigate to="/auth/sign-in" replace />} />
            
            {/* Protected User Routes */}
            <Route path="/cart" element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="/confirmation" element={
              <ProtectedRoute>
                <ConfirmationPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/track-order" element={
              <ProtectedRoute>
                <TrackOrderPage />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ClerkRouterBridge>
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
      </ClerkRouterBridge>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;

