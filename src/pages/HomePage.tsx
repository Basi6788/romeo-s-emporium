import { useRef, useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Tick02Icon } from 'hugeicons-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion'; 
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
import { cn } from "@/lib/utils";
import { AuroraText } from "@/components/magicui/aurora-text";
import ParticleBackground from '@/components/ParticleBackground';
import HeroCard from '@/components/HeroCard';

const MemoizedParticles = memo(ParticleBackground);

// Animation Variants (Fixed & Smoothed)
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 70, damping: 20, mass: 1.2 } 
  }
};

const sliderVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.9
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, type: "spring", bounce: 0.2 }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.6, type: "spring", bounce: 0.2 }
  })
};

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0); 
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState<null | 'lowToHigh' | 'highToLow'>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);

  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: dbHeroImages = [] } = useHeroImages();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- FIX APPLIED HERE ---
  const processedProducts = useMemo(() => {
    let filtered = Array.isArray(products) ? [...products] : [];
    
    if (selectedCategory !== 'All') {
      // FIX: Database image shows column is 'category', not 'category_id'.
      // Also checking both just in case.
      filtered = filtered.filter(p => 
        // Check 1: Agar DB me category ka string/ID 'category' column me hai
        String(p.category) === String(selectedCategory) || 
        // Check 2: Fallback agar code me kahin aur mapping ho
        String(p.category_id) === String(selectedCategory)
      );
    }

    if (sortOrder === 'lowToHigh') {
      filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortOrder === 'highToLow') {
      filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }
    return filtered;
  }, [products, selectedCategory, sortOrder]);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide((prev) => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = dbHeroImages.length - 1;
      if (nextIndex >= dbHeroImages.length) nextIndex = 0;
      return nextIndex;
    });
  }, [dbHeroImages.length]);

  useEffect(() => {
    if (dbHeroImages.length <= 1 || isDragging) return;
    const interval = setInterval(() => paginate(1), 5000);
    return () => clearInterval(interval);
  }, [dbHeroImages.length, paginate, isDragging]);

  const onDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    setIsDragging(false);
    const swipe = Math.abs(offset.x) * velocity.x;

    if (swipe < -100 || offset.x < -100) {
      paginate(1);
    } else if (swipe > 100 || offset.x > 100) {
      paginate(-1);
    }
  };

  return (
    <Layout>
      <motion.div 
        className="min-h-screen w-full bg-background overflow-x-hidden"
        initial="initial"
        animate="animate"
        variants={pageVariants}
      >
        {/* HERO SECTION */}
        <section className="relative w-full h-[550px] md:h-[750px] z-30 overflow-hidden rounded-t-[32px] md:rounded-t-[48px] bg-black">
          <MemoizedParticles />
          
          <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              {dbHeroImages.length > 0 && (
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={sliderVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1} 
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={onDragEnd}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full"
                >
                  <HeroCard slide={dbHeroImages[currentSlide]} isActive={true} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination Dots */}
            {dbHeroImages.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-40">
                {dbHeroImages.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentSlide ? 1 : -1);
                      setCurrentSlide(index);
                    }}
                    className={cn(
                      "h-1.5 rounded-full",
                      index === currentSlide ? "bg-white" : "bg-white/40 hover:bg-white/60"
                    )}
                    animate={{ width: index === currentSlide ? 40 : 12 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CONTENT SECTION */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: -48, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: "spring", bounce: 0.15 }}
          className="relative z-40 bg-background rounded-t-[50px] md:rounded-t-[60px] pt-14 pb-32 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] border-t border-white/20"
        >
          <div className="container mx-auto px-6">
            
            {/* Header & Filter */}
            <div className="flex justify-between items-center mb-8">
              <motion.h1 
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-3xl md:text-5xl font-black text-foreground leading-none tracking-tight"
              >
                TRENDING <br /> <AuroraText>NOW</AuroraText>
              </motion.h1>

              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="p-3 bg-transparent rounded-full flex items-center justify-center relative w-14 h-14"
                >
                  {/* CUSTOM ANIMATED FILTER ICON */}
                  <motion.svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={isFilterOpen ? "open" : "closed"}
                    className="text-foreground block"
                  >
                    <motion.path
                      variants={{
                        closed: { d: "M 3 6 L 21 6", stroke: "currentColor" },
                        open: { d: "M 4 4 L 20 20", stroke: "currentColor" }
                      }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} 
                    />
                    <motion.path
                      d="M 7 12 L 17 12"
                      variants={{
                        closed: { opacity: 1, pathLength: 1 },
                        open: { opacity: 0, pathLength: 0 }
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.path
                      variants={{
                        closed: { d: "M 10 18 L 14 18" },
                        open: { d: "M 4 20 L 20 4" }
                      }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </motion.svg>
                </motion.button>
                
                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="absolute right-0 mt-3 w-64 bg-popover border border-border shadow-2xl rounded-3xl z-50 overflow-hidden"
                    >
                      <button onClick={() => { setSortOrder('lowToHigh'); setIsFilterOpen(false); }} className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold text-foreground hover:bg-accent transition-colors">
                        Price: Low to High 
                        {sortOrder === 'lowToHigh' && <Tick02Icon size={20} className="text-primary" variant="solid" />}
                      </button>
                      <button onClick={() => { setSortOrder('highToLow'); setIsFilterOpen(false); }} className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold text-foreground hover:bg-accent transition-colors">
                        Price: High to Low 
                        {sortOrder === 'highToLow' && <Tick02Icon size={20} className="text-primary" variant="solid" />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Categories - Staggered & Animated */}
            <motion.div 
              className="flex gap-3 overflow-x-auto pb-8 no-scrollbar items-center"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.button
                variants={fadeInUp}
                onClick={() => setSelectedCategory('All')}
                className={cn(
                  "relative px-6 py-2.5 rounded-[30px] text-sm font-medium transition-all flex-shrink-0 overflow-hidden",
                  selectedCategory === 'All' ? "text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {selectedCategory === 'All' && (
                  <motion.div
                    layoutId="category-active"
                    className="absolute inset-0 bg-foreground z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">All</span>
              </motion.button>

              {categories.map((cat: any) => (
                <motion.button
                  key={cat.id}
                  variants={fadeInUp}
                  // IMPORTANT: Agar 'products' table me category ka 'Name' save hai (like "Shoes"),
                  // to yahan 'cat.id' ki jagah 'cat.name' pass karna parega.
                  // Abhi mai 'cat.id' hi rakh raha hun assuming aapne IDs store ki hain.
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "relative px-6 py-2.5 rounded-[30px] text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 overflow-hidden",
                    selectedCategory === cat.id ? "text-background" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {selectedCategory === cat.id && (
                    <motion.div
                      layoutId="category-active"
                      className="absolute inset-0 bg-foreground z-0"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    {(cat.image_url || cat.icon) && (
                      <img src={cat.image_url || cat.icon} alt="" className="w-5 h-5 rounded-full object-cover" />
                    )}
                    {cat.name}
                  </div>
                </motion.button>
              ))}
            </motion.div>

            {/* Product Grid - Layout Animation */}
            <motion.div 
              layout 
              className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12"
            >
              <AnimatePresence mode='popLayout'>
                {processedProducts.length > 0 ? (
                  processedProducts.map((product) => (
                    <motion.div
                      layout
                      key={product.id}
                      variants={fadeInUp}
                      initial="hidden"
                      whileInView="show"
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="col-span-full text-center py-32 text-muted-foreground font-bold italic text-xl uppercase tracking-widest opacity-20"
                  >
                    No Products Found
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default HomePage;


