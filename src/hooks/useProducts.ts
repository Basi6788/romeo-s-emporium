import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { products as fallbackProducts, categories as fallbackCategories } from '@/data/products';

// --- Configuration ---
const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const STORAGE_BUCKET = 'storage/v1/object/public/product-images';

// --- Interfaces (Types) ---
export interface Store {
  id: string;
  name: string;
  avatar_url?: string;
  is_verified?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  description?: string;
  colors?: string[];
  inStock: boolean;
  featured?: boolean;
  store?: Store;          
}

// --- Helper: Data Transform ---
const transformProduct = (product: any): Product => {
  let images: string[] = [];
  
  // 1. Handle New DB Structure (product_images table)
  if (product.product_images && Array.isArray(product.product_images) && product.product_images.length > 0) {
    // Step A: Sort images - Primary image (is_primary: true) sabse pehle
    const sortedImages = [...product.product_images].sort((a: any, b: any) => {
      return (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0);
    });

    // Step B: Construct Full Supabase URL
    images = sortedImages.map((img: any) => {
      // Check different possible column names due to 42703 error
      const path = img.image_path || img.url || img.image || img.path;
      
      if (!path) return '/placeholder.svg';

      if (path.startsWith('http')) {
        return path;
      }
      return `${SUPABASE_PROJECT_URL}/${STORAGE_BUCKET}/${path}`;
    });
  } 
  // 2. Fallback: Legacy comma separated string
  else if (typeof product.image === 'string' && product.image.includes(',')) {
    images = product.image.split(',').map((s: string) => s.trim());
  } 
  // 3. Fallback: Single legacy image column
  else if (product.image) {
    images = [product.image];
  }
  // 4. Default Placeholder
  else {
    images = ['/placeholder.svg'];
  }

  // Ensure unique images only & remove empty/null
  images = [...new Set(images)].filter(Boolean);
  if (images.length === 0) images = ['/placeholder.svg'];

  // 5. Handle Seller/Store Data
  const storeData: Store | undefined = product.sellers ? {
    id: product.sellers.id,
    name: product.sellers.store_name || product.sellers.name || 'Unknown Store',
    avatar_url: product.sellers.avatar_url || product.sellers.logo_url,
    is_verified: product.sellers.is_verified
  } : undefined;

  return {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    originalPrice: product.original_price ? Number(product.original_price) : undefined,
    image: images[0],
    images: images,
    category: product.category,
    rating: product.rating || 4.5,
    reviews: product.reviews || 0,
    description: product.description,
    colors: Array.isArray(product.colors) ? product.colors : [],
    inStock: product.in_stock ?? true,
    featured: product.featured,
    store: storeData, 
  };
};

// --- Hook: Fetch Products (Main) ---
export function useProducts(category?: string) {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      try {
        // 🔥 FIX: Changed query to be safer.
        // Instead of strict FK syntax, we use standard join and select (*) for images
        // This avoids "column does not exist" if 'image_path' is named differently.
        let query = supabase
          .from('products')
          .select(`
            *,
            product_images (*),
            sellers:seller_id ( id, store_name, avatar_url, is_verified )
          `)
          .order('created_at', { ascending: false });
        
        // Note: Agar sellers relation fail ho to sellers!products_seller_id_fkey use karein
        // Maine sellers:seller_id try kiya hai jo standard shorthand hai.

        if (category && category !== 'All') {
          query = query.eq('category', category);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Supabase Error loading products:", error);
          // Agar relation error aaye to fallback products return karein
          throw error;
        }
        
        if (data && data.length > 0) {
          return data.map(transformProduct);
        }

        return category && category !== 'All'
          ? fallbackProducts.filter(p => p.category === category)
          : fallbackProducts;
      } catch (error) {
        console.log('Using fallback products due to error');
        return category && category !== 'All'
          ? fallbackProducts.filter(p => p.category === category)
          : fallbackProducts;
      }
    },
    staleTime: 1000 * 60 * 2, 
  });
}

// 🔥 FIX: Alias for AdminProducts.tsx compatibility
export const useProductsFromDb = useProducts;

// --- Hook: Fetch Single Product ---
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (*),
            sellers:seller_id ( id, store_name, avatar_url, is_verified )
          `)
          .eq('id', id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          return transformProduct(data);
        }
        return fallbackProducts.find(p => p.id === id) || null;
      } catch (error) {
        return fallbackProducts.find(p => p.id === id) || null;
      }
    },
    enabled: !!id,
  });
}

// --- Hook: Create Product (Exports Fix) ---
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: any) => {
      // Remove images array from productData as it goes to a separate table
      const { images, ...productFields } = productData;
      
      const { data, error } = await supabase
        .from('products')
        .insert([productFields])
        .select()
        .single();

      if (error) throw error;
      
      // If we have images, upload them (Logic to be implemented in UI usually, 
      // but here we just return the product)
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      toast.error(error.message || 'Failed to create product');
    }
  });
}

// --- Hook: Update Product ---
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product');
    }
  });
}

// --- Hook: Delete Product ---
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete product');
    }
  });
}

// --- Hook: Fetch Categories ---
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
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
          }));
        }
        
        const { data } = await supabase
          .from('products')
          .select('category')
          .not('category', 'is', null);

        if (data) {
          const unique = [...new Set(data.map(p => p.category))];
          return unique.map(c => ({
            id: c,
            name: c.charAt(0).toUpperCase() + c.slice(1),
            icon: '📦'
          }));
        }

        return fallbackCategories;
      } catch (error) {
        return fallbackCategories;
      }
    }
  });
}

// --- Hook: Follow Store Logic ---
export function useFollowStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, isFollowing }: { storeId: string, isFollowing: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please login to follow stores");

      if (isFollowing) {
        const { error } = await supabase
          .from('store_followers')
          .delete()
          .eq('store_id', storeId)
          .eq('follower_id', user.id);
        if (error) throw error;
        return 'unfollowed';
      } else {
        const { error } = await supabase
          .from('store_followers')
          .insert({ store_id: storeId, follower_id: user.id });
        if (error) throw error;
        return 'followed';
      }
    },
    onSuccess: (data) => {
      toast.success(data === 'followed' ? 'Store Followed!' : 'Store Unfollowed');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Something went wrong");
    }
  });
}

// --- Utility: Upload Product Image ---
export const uploadProductImage = async (file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('product-images') 
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    return data.path;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Image upload failed');
  }
};

