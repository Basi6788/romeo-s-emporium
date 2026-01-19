-- Create categories table for storing category icons
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT '📦',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

-- Authenticated users can manage categories
CREATE POLICY "Authenticated users can manage categories" ON public.categories
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Insert default categories with icons
INSERT INTO public.categories (name, icon, sort_order) VALUES
  ('smartphones', '📱', 1),
  ('laptops', '💻', 2),
  ('tablets', '📟', 3),
  ('audio', '🎧', 4),
  ('wearables', '⌚', 5),
  ('accessories', '🔌', 6),
  ('gaming', '🎮', 7),
  ('cameras', '📷', 8);