// API Configuration
const API_BASE_URL = 'https://Romeo-backend.vercel.app';

export const api = {
  baseUrl: API_BASE_URL,
  
  // Products
  getProducts: () => `${API_BASE_URL}/api/products`,
  getProductById: (id: string) => `${API_BASE_URL}/api/products/${id}`,
  getProductsByCategory: (category: string) => `${API_BASE_URL}/api/products/category/${category}`,
  
  // Categories
  getCategories: () => `${API_BASE_URL}/api/categories`,
  
  // Cart
  getCart: (userId: string) => `${API_BASE_URL}/api/cart/${userId}`,
  addToCart: () => `${API_BASE_URL}/api/cart`,
  updateCart: (id: string) => `${API_BASE_URL}/api/cart/${id}`,
  removeFromCart: (id: string) => `${API_BASE_URL}/api/cart/${id}`,
  
  // Wishlist
  getWishlist: (userId: string) => `${API_BASE_URL}/api/wishlist/${userId}`,
  addToWishlist: () => `${API_BASE_URL}/api/wishlist`,
  removeFromWishlist: (id: string) => `${API_BASE_URL}/api/wishlist/${id}`,
  
  // Auth
  login: () => `${API_BASE_URL}/api/auth/login`,
  register: () => `${API_BASE_URL}/api/auth/register`,
  getProfile: (userId: string) => `${API_BASE_URL}/api/users/${userId}`,
  updateProfile: (userId: string) => `${API_BASE_URL}/api/users/${userId}`,
  
  // Orders
  createOrder: () => `${API_BASE_URL}/api/orders`,
  getOrders: (userId: string) => `${API_BASE_URL}/api/orders/user/${userId}`,
  getAllOrders: () => `${API_BASE_URL}/api/orders`,
  updateOrderStatus: (id: string) => `${API_BASE_URL}/api/orders/${id}`,
  
  // Admin
  getUsers: () => `${API_BASE_URL}/api/users`,
  getAnalytics: () => `${API_BASE_URL}/api/analytics`,
  getSalesData: () => `${API_BASE_URL}/api/analytics/sales`,
  
  // Admin Products
  createProduct: () => `${API_BASE_URL}/api/products`,
  updateProduct: (id: string) => `${API_BASE_URL}/api/products/${id}`,
  deleteProduct: (id: string) => `${API_BASE_URL}/api/products/${id}`,
};

export default api;
