import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react'; // ✅ CLERK IMPORT ADDED
import { toast } from 'sonner';
import { products as fallbackProducts, categories as fallbackCategories } from '@/data/products';

// --- Configuration ---
const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const STORAGE_BUCKET = 'product-images';

// --- Interfaces (Same as before) ---
export interface Store {
  id: string;
  name: string;
  handle?: string;
  logo_url?: string;
  rating?: number;
  is_verified?: boolean;
}

export interface Seller {
  id: string;
  name: string;
  avatar_url?: string;
  is_verified?: boolean;
  store?: Store;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  customer_name: string;
  created_at: string;
  seller_reply?: string;
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
  reviewsCount: number;
  description?: string;
  colors?: string[];
  inStock: boolean;
  featured?: boolean;
  seller?: Seller;
  store?: Store;
  reviewsData?: Review[];
}

// --- Helper: Data Transform (Same as before) ---
const transformProduct = (product: any): Product => {
  let images: string[] = [];
  
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const sortedImages = [...product.images].sort((a: any, b: any) => 
      (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)
    );

    images = sortedImages.map((img: any) => {
      const path = img.image_url || img.url || img.path;
      if (!path) return '/placeholder.svg';
      if (path.startsWith('http')) return path;
      return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
    });
  } else if (product.image) {
    images = [product.image];
  } else {
    images = ['/placeholder.svg'];
  }

  let sellerData: Seller | undefined;
  let storeData: Store | undefined;

  if (product.seller) {
    sellerData = {
      id: product.seller.id,
      name: product.seller.name || 'Unknown Seller',
      avatar_url: product.seller.avatar_url,
      is_verified: product.seller.is_verified,
    };
    if (product.seller.store) {
      storeData = {
        id: product.seller.store.id,
        name: product.seller.store.name,
        handle: product.seller.store.handle,
        logo_url: product.seller.store.logo_url,
        rating: product.seller.store.rating,
        is_verified: product.seller.store.verified
      };
      sellerData.store = storeData;
    }
  }

  return {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    originalPrice: product.original_price ? Number(product.original_price) : undefined,
    image: images[0] || '/placeholder.svg',
    images: images,   
    category: product.category,
    rating: product.rating || 0,
    reviewsCount: product.reviews_count || 0,
    description: product.description,
    colors: Array.isArray(product.colors) ? product.colors : [],
    inStock: product.in_stock ?? true,
    featured: product.featured,
    seller: sellerData,
    store: storeData,
    reviewsData: product.reviews
  };
};

// --- Hook 1: Fetch Products ---
export function useProducts(category?: string, page = 0, limit = 20) {
  return useQuery({
    queryKey: ['products', category, page],
    queryFn: async () => {
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            seller:sellers!products_seller_id_fkey(
              id, name, avatar_url, rating, is_verified,
              store:stores!sellers_store_id_fkey(
                id, name, handle, logo_url, verified, rating
              )
            ),
            images:product_images!product_images_product_id_fkey(
              id, image_url, is_primary, sort_order
            )
          `)
          .eq('in_stock', true)
          .order('created_at', { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);
        
        if (category && category !== 'All') {
          query = query.eq('category', category);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data ? data.map(transformProduct) : [];
      } catch (error) {
        console.error("Fetch Error:", error);
        return category && category !== 'All' 
          ? fallbackProducts.filter(p => p.category === category) 
          : fallbackProducts;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

// --- Hook 2: Fetch Single Product ---
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            seller:sellers!products_seller_id_fkey(
              id, name, avatar_url, rating, is_verified,
              store:stores!sellers_store_id_fkey(*)
            ),
            images:product_images!product_images_product_id_fkey(*)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return transformProduct(data);
      } catch (error) {
        return fallbackProducts.find(p => p.id === id) || null;
      }
    },
    enabled: !!id,
  });
}

// --- Hook 3: Product Reviews ---
export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!productId
  });
}

// --- Hook 4: Store Profile ---
export function useStore(storeHandle: string) {
  return useQuery({
    queryKey: ['store', storeHandle],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select(`
          *,
          products:products!products_store_id_fkey(
            id, name, price, image, rating
          )
        `)
        .eq('handle', storeHandle)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!storeHandle
  });
}

// --- Hook 5: Store Follow/Unfollow (UPDATED FOR CLERK) ---
// ✅ Yeh logic ab Clerk User ID use karti hai
export function useStoreFollow(storeId: string) {
  const queryClient = useQueryClient();
  
  // ✅ Clerk se user uthaya
  const { user, isLoaded } = useUser();
  const userId = user?.id; // Clerk User ID (string like 'user_2N...')

  // Check if following
  const { data: isFollowing, isLoading: isCheckLoading } = useQuery({
    queryKey: ['isFollowing', storeId, userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data } = await supabase
        .from('store_followers')
        .select('id')
        .eq('store_id', storeId)
        .eq('user_id', userId) // Using Clerk ID here
        .maybeSingle();
        
      return !!data;
    },
    enabled: !!storeId && !!userId && isLoaded
  });

  // Toggle Follow Mutation
  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Please login to follow stores");
      
      if (isFollowing) {
        // Unfollow Logic
        const { error } = await supabase.from('store_followers')
          .delete()
          .eq('store_id', storeId)
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Follow Logic
        const { error } = await supabase.from('store_followers').insert({
          store_id: storeId,
          user_id: userId // Saving Clerk ID to Supabase
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Refresh UI state
      queryClient.invalidateQueries({ queryKey: ['isFollowing', storeId] });
      queryClient.invalidateQueries({ queryKey: ['store_followers_count', storeId] }); 
      
      toast.success(isFollowing ? "Store unfollowed" : "You are now following this store!");
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    }
  });

  return { 
    isFollowing, 
    toggleFollow: mutation.mutate, 
    isLoading: mutation.isPending || isCheckLoading,
    isAuthenticated: !!userId
  };
}

// --- Hook 6: Categories ---
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) return fallbackCategories;
      
      return data.map(cat => ({
        id: cat.name,
        name: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
        icon: cat.icon || '📦',
        image_url: cat.image_url
      }));
    }
  });
}

// --- Helper: Upload Image ---
export const uploadProductImage = async (file: File) => {
  // Note: Upload usually requires Auth. If using Clerk, you might need 
  // to setup Supabase RLS to allow public uploads or use a signed URL strategy
  // currently keeping it basic.
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('product-images') 
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;
    return data.path;
  } catch (error: any) {
    throw new Error(error.message || 'Upload failed');
  }
};

