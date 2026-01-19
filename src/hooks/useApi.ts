import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { products as fallbackProducts, categories as fallbackCategories } from '@/data/products';

// Transform Supabase product to match the expected Product interface
const transformProduct = (product: any) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  originalPrice: product.original_price,
  image: product.image || '/placeholder.svg',
  category: product.category,
  rating: product.rating || 4.5,
  reviews: product.reviews || 0,
  description: product.description,
  colors: product.colors || [],
  inStock: product.in_stock ?? true,
  featured: product.featured,
});

export function useProducts(category?: string) {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      try {
        let query = supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (category) {
          query = query.eq('category', category);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          return data.map(transformProduct);
        }
        // Fallback to local data if no products in DB
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
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) throw error;
        
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
        // First try to get categories from the categories table
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        
        if (!catError && catData && catData.length > 0) {
          return catData.map(cat => ({
            id: cat.name,
            name: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
            icon: cat.icon,
            image_url: cat.image_url,
            image: `/placeholder.svg`,
          }));
        }
        
        // Fallback: Get unique categories from products table
        const { data, error } = await supabase
          .from('products')
          .select('category')
          .order('category');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const uniqueCategories = [...new Set(data.map(p => p.category))];
          return uniqueCategories.map((cat, index) => ({
            id: cat,
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            icon: '📦',
            image_url: null,
            image: `/placeholder.svg`,
          }));
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
