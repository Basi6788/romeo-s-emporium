// Mock product data for demo purposes
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  colors?: string[];
  inStock: boolean;
  featured?: boolean;
}

export const categories = [
  { id: 'mobile', name: 'Mobile', icon: '📱', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200' },
  { id: 'headphone', name: 'Headphones', icon: '🎧', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' },
  { id: 'tablet', name: 'Tablets', icon: '📲', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200' },
  { id: 'laptop', name: 'Laptops', icon: '💻', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200' },
  { id: 'speaker', name: 'Speakers', icon: '🔊', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200' },
  { id: 'watch', name: 'Watches', icon: '⌚', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200' },
  { id: 'camera', name: 'Cameras', icon: '📷', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=200' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'iPhone 16 Pro Max',
    price: 1399.99,
    originalPrice: 1499.99,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
    category: 'mobile',
    rating: 4.9,
    reviews: 2453,
    description: 'The most powerful iPhone ever with A18 Pro chip, titanium design, and advanced camera system.',
    colors: ['#1C1C1E', '#F5F5F7', '#4B4F54', '#5E5C5A'],
    inStock: true,
    featured: true
  },
  {
    id: '2',
    name: 'Apple Watch Ultra 2',
    price: 799.99,
    originalPrice: 899.99,
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
    category: 'watch',
    rating: 4.8,
    reviews: 1876,
    description: 'The most rugged and capable Apple Watch with precision dual-frequency GPS.',
    colors: ['#1C1C1E', '#F5F5F7', '#FF6B00'],
    inStock: true,
    featured: true
  },
  {
    id: '3',
    name: 'AirPods Pro 2',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400',
    category: 'headphone',
    rating: 4.7,
    reviews: 3421,
    description: 'Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio.',
    colors: ['#F5F5F7'],
    inStock: true,
    featured: true
  },
  {
    id: '4',
    name: 'MacBook Pro 16"',
    price: 2499.99,
    originalPrice: 2699.99,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    category: 'laptop',
    rating: 4.9,
    reviews: 1234,
    description: 'M3 Pro chip, stunning Liquid Retina XDR display, and all-day battery life.',
    colors: ['#1C1C1E', '#F5F5F7'],
    inStock: true,
    featured: true
  },
  {
    id: '5',
    name: 'Samsung Galaxy S24 Ultra',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
    category: 'mobile',
    rating: 4.8,
    reviews: 2134,
    description: 'Galaxy AI, built-in S Pen, and 200MP camera for incredible detail.',
    colors: ['#1C1C1E', '#F5F5F7', '#E8DCC4', '#B3A090'],
    inStock: true
  },
  {
    id: '6',
    name: 'Sony WH-1000XM5',
    price: 349.99,
    originalPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
    category: 'headphone',
    rating: 4.8,
    reviews: 2876,
    description: 'Industry-leading noise cancellation with Auto NC Optimizer.',
    colors: ['#1C1C1E', '#F5F5F7', '#D4C5A9'],
    inStock: true
  },
  {
    id: '7',
    name: 'iPad Pro 12.9"',
    price: 1099.99,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    category: 'tablet',
    rating: 4.9,
    reviews: 1567,
    description: 'M2 chip, Liquid Retina XDR display, and all-day battery life.',
    colors: ['#1C1C1E', '#F5F5F7'],
    inStock: true
  },
  {
    id: '8',
    name: 'Sony Alpha A7 IV',
    price: 2499.99,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
    category: 'camera',
    rating: 4.9,
    reviews: 876,
    description: 'Full-frame 33MP sensor with advanced autofocus and 4K60 video.',
    colors: ['#1C1C1E'],
    inStock: true
  },
  {
    id: '9',
    name: 'HomePod 2nd Gen',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    category: 'speaker',
    rating: 4.6,
    reviews: 987,
    description: 'Room-filling spatial audio with Dolby Atmos and smart home hub.',
    colors: ['#1C1C1E', '#F5F5F7'],
    inStock: true
  },
  {
    id: '10',
    name: 'PS5 DualSense Edge',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
    category: 'gaming',
    rating: 4.7,
    reviews: 1234,
    description: 'Ultra-customizable wireless controller with replaceable stick modules.',
    colors: ['#1C1C1E', '#F5F5F7'],
    inStock: true
  },
  {
    id: '11',
    name: 'Dell XPS 15',
    price: 1799.99,
    originalPrice: 1999.99,
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
    category: 'laptop',
    rating: 4.7,
    reviews: 876,
    description: '15.6" OLED display, 13th Gen Intel Core i7, and stunning InfinityEdge.',
    colors: ['#1C1C1E', '#F5F5F7'],
    inStock: true
  },
  {
    id: '12',
    name: 'Google Pixel 8 Pro',
    price: 999.99,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',
    category: 'mobile',
    rating: 4.7,
    reviews: 1456,
    description: 'Google Tensor G3, best Pixel camera yet, and 7 years of updates.',
    colors: ['#1C1C1E', '#F5F5F7', '#B4D4E7'],
    inStock: true
  },
];
