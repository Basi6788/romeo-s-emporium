-- Add image_url column to categories for custom icon images
ALTER TABLE public.categories 
ADD COLUMN image_url TEXT DEFAULT NULL;