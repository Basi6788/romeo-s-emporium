-- Create hero_images table for managing homepage banners
CREATE TABLE public.hero_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT NOT NULL,
  gradient TEXT DEFAULT 'from-violet-600 via-purple-600 to-indigo-800',
  badge TEXT DEFAULT 'New',
  link TEXT DEFAULT '/products',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view active hero images
CREATE POLICY "Anyone can view active hero images"
ON public.hero_images
FOR SELECT
USING (is_active = true);

-- Authenticated users can manage hero images (admin check should be in app)
CREATE POLICY "Authenticated users can manage hero images"
ON public.hero_images
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER update_hero_images_updated_at
BEFORE UPDATE ON public.hero_images
FOR EACH ROW
EXECUTE FUNCTION public.update_orders_updated_at();