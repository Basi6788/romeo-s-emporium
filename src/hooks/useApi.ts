import { useQuery } from '@tanstack/react-query';
import api, { ApiProduct, ApiCategory } from '@/lib/api';
import { products as fallbackProducts, categories as fallbackCategories } from '@/data/products';

// Transform API product to match our Product interface
const transformProduct = (product: ApiProduct) => ({
  id: product._id || product.id,
  name: product.name,
  price: product.price,
  originalPrice: product.originalPrice,
  image: product.image || product.images?.[0] || '/placeholder.svg',
  category: product.category,
  rating: product.rating || 4.5,
  reviews: product.reviews || Math.floor(Math.random() * 200) + 10,
  description: product.description,
  colors: product.colors,
  inStock: product.inStock ?? true,
  featured: product.featured,
});

// Transform API category
const transformCategory = (category: ApiCategory) => ({
  id: category._id || category.id,
  name: category.name,
  icon: category.icon || '📦',
  image: category.image,
});

export function useProducts(category?: string) {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      try {
        const data = category 
          ? await api.getProductsByCategory(category)
          : await api.getProducts();
        
        if (data && data.length > 0) {
          return data.map(transformProduct);
        }
        // Fallback to local data
        return category 
          ? fallbackProducts.filter(p => p.category === category)
          : fallbackProducts;
      } catch (error) {
        console.log('Using fallback products');
        return category 
          ? fallbackProducts.filter(p => p.category === category)
          : fallbackProducts;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        const data = await api.getProductById(id);
        if (data) {
          return transformProduct(data);
        }
        // Fallback to local data
        return fallbackProducts.find(p => p.id === id) || null;
      } catch (error) {
        console.log('Using fallback product');
        return fallbackProducts.find(p => p.id === id) || null;
      }
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const data = await api.getCategories();
        if (data && data.length > 0) {
          return data.map(transformCategory);
        }
        return fallbackCategories;
      } catch (error) {
        console.log('Using fallback categories');
        return fallbackCategories;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
