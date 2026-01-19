import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeroImage {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  gradient: string;
  badge: string;
  link: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeroImageInsert {
  title: string;
  subtitle?: string | null;
  image: string;
  gradient?: string;
  badge?: string;
  link?: string;
  sort_order?: number;
  is_active?: boolean;
}

export const useHeroImages = () => {
  return useQuery({
    queryKey: ['hero-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as HeroImage[];
    },
  });
};

export const useAllHeroImages = () => {
  return useQuery({
    queryKey: ['hero-images-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as HeroImage[];
    },
  });
};

export const useCreateHeroImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (heroImage: HeroImageInsert) => {
      const { data, error } = await supabase
        .from('hero_images')
        .insert(heroImage)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images'] });
      queryClient.invalidateQueries({ queryKey: ['hero-images-all'] });
    },
  });
};

export const useUpdateHeroImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<HeroImageInsert> }) => {
      const { data, error } = await supabase
        .from('hero_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images'] });
      queryClient.invalidateQueries({ queryKey: ['hero-images-all'] });
    },
  });
};

export const useDeleteHeroImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hero_images')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images'] });
      queryClient.invalidateQueries({ queryKey: ['hero-images-all'] });
    },
  });
};

export const useUpdateHeroImagesOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (heroes: { id: string; sort_order: number }[]) => {
      const updates = heroes.map(hero => 
        supabase
          .from('hero_images')
          .update({ sort_order: hero.sort_order })
          .eq('id', hero.id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images'] });
      queryClient.invalidateQueries({ queryKey: ['hero-images-all'] });
    },
  });
};

export const uploadHeroImage = async (file: File): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `hero-${Date.now()}.${fileExt}`;
  const filePath = `heroes/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading hero image:', uploadError);
    return null;
  }

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
