// API Configuration
const API_BASE_URL = 'https://romeo-backend.vercel.app';

export interface ApiProduct {
  id: string;
  _id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  rating?: number;
  reviews?: number;
  description?: string;
  colors?: string[];
  inStock?: boolean;
  featured?: boolean;
}

export interface ApiCategory {
  id: string;
  _id?: string;
  name: string;
  icon?: string;
  image?: string;
}

// Helper function to handle API calls
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

export const api = {
  baseUrl: API_BASE_URL,

  // Products
  async getProducts(): Promise<ApiProduct[]> {
    try {
      const data = await fetchApi<ApiProduct[] | { products: ApiProduct[] }>(`${API_BASE_URL}/api/products`);
      return Array.isArray(data) ? data : data.products || [];
    } catch {
      return [];
    }
  },

  async getProductById(id: string): Promise<ApiProduct | null> {
    try {
      return await fetchApi<ApiProduct>(`${API_BASE_URL}/api/products/${id}`);
    } catch {
      return null;
    }
  },

  async getProductsByCategory(category: string): Promise<ApiProduct[]> {
    try {
      const data = await fetchApi<ApiProduct[] | { products: ApiProduct[] }>(`${API_BASE_URL}/api/products/category/${category}`);
      return Array.isArray(data) ? data : data.products || [];
    } catch {
      return [];
    }
  },

  // Categories
  async getCategories(): Promise<ApiCategory[]> {
    try {
      const data = await fetchApi<ApiCategory[] | { categories: ApiCategory[] }>(`${API_BASE_URL}/api/categories`);
      return Array.isArray(data) ? data : data.categories || [];
    } catch {
      return [];
    }
  },

  // Auth
  async login(email: string, password: string) {
    return fetchApi(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(name: string, email: string, password: string) {
    return fetchApi(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  // Orders
  async createOrder(orderData: any) {
    return fetchApi(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getOrders(userId: string) {
    return fetchApi(`${API_BASE_URL}/api/orders/user/${userId}`);
  },

  async getAllOrders() {
    return fetchApi(`${API_BASE_URL}/api/orders`);
  },

  // Admin
  async getUsers() {
    return fetchApi(`${API_BASE_URL}/api/users`);
  },

  async getAnalytics() {
    return fetchApi(`${API_BASE_URL}/api/analytics`);
  },
};

export default api;
