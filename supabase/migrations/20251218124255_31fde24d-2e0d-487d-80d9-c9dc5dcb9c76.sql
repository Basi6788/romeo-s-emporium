-- Create products table with inventory management
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  image TEXT,
  category TEXT NOT NULL,
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  colors TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  sku TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can view products
CREATE POLICY "Anyone can view products"
ON public.products
FOR SELECT
USING (true);

-- Allow inserts/updates/deletes for authenticated users (admin check can be added later)
CREATE POLICY "Authenticated users can manage products"
ON public.products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_orders_updated_at();

-- Enable realtime for products
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- Insert sample products with stock data
INSERT INTO public.products (name, description, price, original_price, image, category, rating, reviews, colors, in_stock, featured, stock_quantity, low_stock_threshold, sku) VALUES
('iPhone 16 Pro Max', 'The most powerful iPhone ever with A18 Pro chip, titanium design, and advanced camera system.', 1399.99, 1499.99, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', 'mobile', 4.9, 2453, ARRAY['#1C1C1E', '#F5F5F7', '#4B4F54', '#5E5C5A'], true, true, 45, 10, 'IP16PM-001'),
('Apple Watch Ultra 2', 'The most rugged and capable Apple Watch with precision dual-frequency GPS.', 799.99, 899.99, 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400', 'watch', 4.8, 1876, ARRAY['#1C1C1E', '#F5F5F7', '#FF6B00'], true, true, 8, 10, 'AWU2-001'),
('AirPods Pro 2', 'Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio.', 249.99, NULL, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400', 'headphone', 4.7, 3421, ARRAY['#F5F5F7'], true, true, 120, 20, 'APP2-001'),
('MacBook Pro 16"', 'M3 Pro chip, stunning Liquid Retina XDR display, and all-day battery life.', 2499.99, 2699.99, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 'laptop', 4.9, 1234, ARRAY['#1C1C1E', '#F5F5F7'], true, true, 23, 10, 'MBP16-001'),
('Samsung Galaxy S24 Ultra', 'Galaxy AI, built-in S Pen, and 200MP camera for incredible detail.', 1299.99, NULL, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', 'mobile', 4.8, 2134, ARRAY['#1C1C1E', '#F5F5F7', '#E8DCC4', '#B3A090'], true, false, 3, 10, 'SGS24U-001'),
('Sony WH-1000XM5', 'Industry-leading noise cancellation with Auto NC Optimizer.', 349.99, 399.99, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400', 'headphone', 4.8, 2876, ARRAY['#1C1C1E', '#F5F5F7', '#D4C5A9'], true, false, 67, 15, 'SWHXM5-001'),
('iPad Pro 12.9"', 'M2 chip, Liquid Retina XDR display, and all-day battery life.', 1099.99, NULL, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', 'tablet', 4.9, 1567, ARRAY['#1C1C1E', '#F5F5F7'], true, false, 0, 10, 'IPP129-001'),
('Sony Alpha A7 IV', 'Full-frame 33MP sensor with advanced autofocus and 4K60 video.', 2499.99, NULL, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', 'camera', 4.9, 876, ARRAY['#1C1C1E'], true, false, 12, 5, 'SA7IV-001'),
('HomePod 2nd Gen', 'Room-filling spatial audio with Dolby Atmos and smart home hub.', 299.99, NULL, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 'speaker', 4.6, 987, ARRAY['#1C1C1E', '#F5F5F7'], true, false, 34, 10, 'HP2-001'),
('PS5 DualSense Edge', 'Ultra-customizable wireless controller with replaceable stick modules.', 199.99, NULL, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400', 'gaming', 4.7, 1234, ARRAY['#1C1C1E', '#F5F5F7'], true, false, 5, 10, 'PS5DSE-001'),
('Dell XPS 15', '15.6" OLED display, 13th Gen Intel Core i7, and stunning InfinityEdge.', 1799.99, 1999.99, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400', 'laptop', 4.7, 876, ARRAY['#1C1C1E', '#F5F5F7'], true, false, 18, 10, 'DXPS15-001'),
('Google Pixel 8 Pro', 'Google Tensor G3, best Pixel camera yet, and 7 years of updates.', 999.99, NULL, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400', 'mobile', 4.7, 1456, ARRAY['#1C1C1E', '#F5F5F7', '#B4D4E7'], true, false, 28, 10, 'GP8P-001');