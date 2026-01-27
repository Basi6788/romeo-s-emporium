import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { ReactLenis } from "lenis/react";
import { ClerkProvider, useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CompareProvider } from "@/contexts/CompareContext";

import ScrollToTop from "@/components/ScrollToTop";
import CompareBar from "@/components/CompareBar";
import CompareModal from "@/components/CompareModal";

// --- Imports ---
import OledLoader from "./components/OledLoader";

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
// MepcoBill Removed
import HelpCenter from "./pages/HelpCenter";

// Admin Imports
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

// --- CSS for Hiding Scrollbar but keeping functionality ---
const GlobalScrollStyles = () => (
  <style>{`
    html, body {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE/Edge */
    }
    html::-webkit-scrollbar, body::-webkit-scrollbar {
      display: none; /* Chrome/Safari/Opera */
    }
  `}</style>
);

// --- 1. FIXED ADMIN ROUTE ---
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading, isAuthenticated } = useAuth();
  if (loading) return <OledLoader />;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/auth/sign-in" replace />;
  return <>{children}</>;
};

// --- 2. FIXED GUEST ROUTE ---
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, userId } = useClerkAuth();
  if (!isLoaded) return <OledLoader />;
  if (userId) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// --- 3. CLERK BRIDGE ---
const ClerkRouterBridge = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      signInForceRedirectUrl="/"
      signUpForceRedirectUrl="/"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
};

const MainContent = () => {
  const location = useLocation();
  const { isLoaded } = useUser();

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Basic Loading Check
  if (!isLoaded) return <OledLoader />;

  return (
    <div className="flex flex-col min-h-[100dvh] w-full overflow-x-hidden relative bg-background">
      <main className="flex-1 w-full">
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          {/* Mepco Route Removed */}
          <Route path="/help" element={<HelpCenter />} />

          {/* SSO Callback Route */}
          <Route path="/sso-callback" element={<Navigate to="/" replace />} />

          <Route path="/auth/sign-in/*" element={<GuestRoute><AuthPage /></GuestRoute>} />
          <Route path="/auth/sign-up/*" element={<GuestRoute><AuthPage /></GuestRoute>} />
          <Route path="/auth" element={<Navigate to="/auth/sign-in" replace />} />

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

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Floating Admin Button Removed Here */}

      {!isAdminRoute && (
        <>
          <CompareBar />
          <CompareModal />
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
                    {/* Global Styles for removing scrollbar */}
                    <GlobalScrollStyles />
                    {/* Lenis configuration for smooth scroll */}
                    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
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

