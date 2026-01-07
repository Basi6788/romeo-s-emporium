// src/pages/HomePage.tsx or src/App.tsx (main page)
import { useRef, useEffect } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SceneContainer from '@/scenes/SceneContainer';
import ProductCard from '@/components/ProductCard';
import FloatingCart from '@/components/FloatingCart';
import useTheme from '@/hooks/useTheme';

gsap.registerPlugin(ScrollTrigger);

const products = [
  {
    id: 1,
    name: 'AirPods Pro',
    price: 499.00,
    category: 'headphones',
    image: 'https://content.abt.com/image.php/Apple-AirPods-Pro-2nd-Gen-MQD83AMA-With-Case.jpg?image=/images/products/BDP_Images/Apple-AirPods-Pro-2nd-Gen-MQD83AMA-With-Case.jpg&canvas=1&width=750&height=550',
  },
  {
    id: 2,
    name: 'HomePod Mini',
    price: 349.00,
    category: 'speakers',
    image: 'https://m.media-amazon.com/images/I/61o-DCbNtxL._AC_SL1500_.jpg',
  },
  {
    id: 3,
    name: 'Headphones',
    price: 620.00,
    category: 'headphones',
    image: 'https://cdn.mos.cms.futurecdn.net/kLbTcErGPje7DjJEMWchT9.jpg',
  },
  {
    id: 4,
    name: 'Earphones',
    price: 160.00,
    category: 'headphones',
    image: 'https://www.apple.com/newsroom/images/product/airpods/standard/Apple_AirPods-3rd-gen_hero_10182021.jpg.landing-big_2x.jpg',
  },
];

const categories = ['All', 'Headphones', 'Speakers'];

const HomePage = () => {
  const { theme } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = products.filter(p => 
    selectedCategory === 'All' || p.category === selectedCategory.toLowerCase()
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero title and chips fade/blur on scroll
      gsap.to(titleRef.current, {
        y: -120,
        opacity: 0,
        filter: 'blur(10px)',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=400',
          scrub: 1,
        },
      });

      gsap.to(chipsRef.current, {
        y: -100,
        opacity: 0,
        filter: 'blur(8px)',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=300',
          scrub: 1,
        },
      });

      // Product cards entrance
      gsap.fromTo('.product-card-enter', 
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.products-grid',
            start: 'top 85%',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleChipHover = (e: React.MouseEvent<HTMLDivElement>, enter: boolean) => {
    gsap.to(e.currentTarget, {
      scale: enter ? 1.1 : 1,
      y: enter ? -6 : 0,
      duration: 0.4,
      ease: 'elastic.out(1,0.4)',
    });
  };

  return (
    <div className="min-h-screen relative bg-[#FFD1D1] dark:bg-black text-gray-900 dark:text-white overflow-x-hidden">
      {/* 3D Background Canvas */}
      <div className="fixed inset-0 -z-10">
        <SceneContainer />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 pt-10 pb-6">
        <div className="max-w-xl mx-auto flex items-center justify-center relative backdrop-blur-xl bg-white/70 dark:bg-black/70 rounded-full px-6 py-4 shadow-xl border border-white/20 dark:border-white/10">
          <div className="flex-1 flex items-center">
            <Search className="absolute left-10 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-4 py-3 bg-transparent text-base focus:outline-none"
            />
          </div>
          <button className="ml-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 shadow-lg" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-40 pb-24 px-6 min-h-screen flex flex-col">
        <div className="max-w-xl mx-auto text-center flex-1 flex flex-col justify-center">
          <h1 ref={titleRef} className="text-6xl md:text-7xl font-bold mb-12 leading-none">
            New<br />arrivals
          </h1>

          <div ref={chipsRef} className="flex items-center justify-center gap-4">
            {categories.map((cat) => (
              <div
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                onMouseEnter={(e) => handleChipHover(e, true)}
                onMouseLeave={(e) => handleChipHover(e, false)}
                className={`px-8 py-4 rounded-full font-semibold cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                    : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-md'
                }`}
              >
                {cat}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-grid px-6 pb-40">
        <div className="max-w-xl mx-auto grid grid-cols-2 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card-enter">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Floating Cart */}
      <FloatingCart total={1099.00} items={3} />
    </div>
  );
};

export default HomePage;