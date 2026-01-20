import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { 
  SlidersHorizontal, 
  Grid, 
  List, 
  X, 
  Loader2, 
  Zap, 
  LayoutGrid, 
  Search,
  Package,
  RotateCcw // Icon for reset
} from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Supabase Types match
interface Category {
  id: string;
  name: string;
  image_url?: string | null;
  icon?: string | null;
}

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // States
  const [activeTab, setActiveTab] = useState('all'); 
  const [priceRange, setPriceRange] = useState<{min: string, max: string}>({ min: '', max: '' });
  const [appliedPriceRange, setAppliedPriceRange] = useState<{min: number, max: number}>({ min: 0, max: 1000000 });
  const [sortBy, setSortBy] = useState('featured');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  // 1. Logic to count products per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const key = p.category || 'uncategorized'; 
      // Agar ID bhi use ho rahi hai tu usay bhi map kar sakte hain
      if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [products]);

  // 2. Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category
    if (activeTab === 'recommended') {
      result = result.filter(p => p.rating >= 4.5 || p.featured);
    } else if (activeTab !== 'all') {
      // Dono check kar rahe hain taake name ya ID kisi se bhi match hu jaye
      result = result.filter(p => p.category === activeTab || p.category_id === activeTab);
    }

    // Price
    result = result.filter(p => 
      p.price >= appliedPriceRange.min && 
      p.price <= appliedPriceRange.max
    );

    // Sort
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'newest': result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
    }

    return result;
  }, [products, activeTab, appliedPriceRange, sortBy]);

  // Helper to check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      activeTab !== 'all' ||
      appliedPriceRange.min > 0 ||
      appliedPriceRange.max < 1000000 ||
      sortBy !== 'featured'
    );
  }, [activeTab, appliedPriceRange, sortBy]);

  // Animation for Categories (Only runs ONCE on mount or when categories load)
  useEffect(() => {
    if (!categoriesRef.current || categories.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from(categoriesRef.current.children, {
        y: 20, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out'
      });
    }, categoriesRef); // Scope to categoriesRef
    return () => ctx.revert();
  }, [categories.length]); // Dependency array fixed to prevent re-animation on tab change

  // Animation for Products (Runs when products list changes)
  useEffect(() => {
    if (!productsRef.current || productsLoading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.product-item',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
      );
    }, productsRef);
    return () => ctx.revert();
  }, [filteredProducts, productsLoading]); // activeTab removed to stop category jump

  // Actions
  const applyFilters = () => {
    const min = priceRange.min ? parseFloat(priceRange.min) : 0;
    const max = priceRange.max ? parseFloat(priceRange.max) : 1000000;
    setAppliedPriceRange({ min, max });
    setIsFilterOpen(false);
  };

  const clearAllFilters = () => {
    setPriceRange({ min: '', max: '' });
    setAppliedPriceRange({ min: 0, max: 1000000 });
    setSortBy('featured');
    setActiveTab('all');
    setIsFilterOpen(false);
  };

  // Lock Scroll
  useEffect(() => {
    if (isFilterOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isFilterOpen]);

  return (
    <Layout>
      <div ref={containerRef} className="min-h-screen bg-background text-foreground relative">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm">
          <div className="container mx-auto px-4 pt-6 pb-4 space-y-5">
            
            <div className="flex items-center justify-between">
              <div>
                {/* Updated Title */}
                <h1 className="text-3xl font-black tracking-tighter uppercase text-foreground">
                  EXPLORE
                </h1>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {filteredProducts.length} items found
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                
                {/* Clear Filter Button (Visible only if filters active) */}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 rounded-full transition-all animate-in fade-in slide-in-from-right-4"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}

                {/* View Toggles */}
                <div className="hidden sm:flex bg-muted/50 rounded-lg p-1 border border-border">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'}`}>
                    <Grid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </button>
              </div>
            </div>

            {/* Categories Strip */}
            <div className="relative">
              <div 
                ref={categoriesRef}
                className="flex overflow-x-auto pb-2 pt-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 gap-3 items-center"
              >
                {/* All - Never Grey */}
                <CategoryPill 
                  active={activeTab === 'all'} 
                  onClick={() => setActiveTab('all')}
                  icon={<LayoutGrid className="w-4 h-4" />}
                  label="All"
                  disabledLook={false} 
                />

                {/* For You - Never Grey */}
                <CategoryPill 
                  active={activeTab === 'recommended'} 
                  onClick={() => setActiveTab('recommended')}
                  icon={<Zap className="w-4 h-4" />}
                  label="For You"
                  special
                  disabledLook={false}
                />

                {/* Dynamic Categories - Grey only if count is 0 */}
                {categories.map((cat: Category) => {
                  const count = categoryCounts[cat.id] || categoryCounts[cat.name] || 0;
                  const isEmpty = count === 0;

                  return (
                    <CategoryPill 
                      key={cat.id}
                      active={activeTab === cat.id} 
                      onClick={() => setActiveTab(cat.id)}
                      icon={
                        cat.image_url ? (
                          <img 
                            src={cat.image_url} 
                            alt={cat.name} 
                            className="w-5 h-5 object-contain rounded-full" 
                          />
                        ) : (
                          <Package className="w-4 h-4" />
                        )
                      }
                      label={cat.name}
                      disabledLook={isEmpty}
                    />
                  );
                })}
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="container mx-auto px-4 py-8 min-h-[60vh]">
          {productsLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95">
              <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">No Products Found</h2>
              <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                Try changing your filters or search criteria.
              </p>
              <button onClick={clearAllFilters} className="text-primary font-semibold hover:underline">
                Reset filters
              </button>
            </div>
          ) : (
            <div 
              ref={productsRef}
              className={`grid gap-5 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                  : 'grid-cols-1 max-w-2xl mx-auto'
              }`}
            >
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-item h-full">
                  <ProductCard product={product} viewMode={viewMode} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- FIXED CENTER DIALOG WITH PORTAL --- */}
        {isFilterOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsFilterOpen(false)}
            />
            
            {/* Dialog Container */}
            <div className="relative w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden">
              
              {/* Header */}
              <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-card shrink-0">
                <h2 className="text-lg font-bold">Filter & Sort</h2>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                
                {/* Sort Section */}
                <section>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Sort By</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { id: 'featured', label: 'Featured' },
                      { id: 'newest', label: 'Newest' },
                      { id: 'price-low', label: 'Price: Low-High' },
                      { id: 'price-high', label: 'Price: High-Low' },
                      { id: 'rating', label: 'Top Rated' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id)}
                        className={`
                          relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all border
                          ${sortBy === opt.id 
                            ? 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400' 
                            : 'border-border bg-muted/30 text-foreground hover:bg-muted'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Price Range Section */}
                <section>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Price Range</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-full">
                      <label className="text-[10px] text-muted-foreground mb-1 block">Min (Rs.)</label>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        placeholder="0"
                        className="w-full px-3 py-3 bg-muted/20 border border-border rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                      />
                    </div>
                    <div className="w-full">
                      <label className="text-[10px] text-muted-foreground mb-1 block">Max (Rs.)</label>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        placeholder="MAX"
                        className="w-full px-3 py-3 bg-muted/20 border border-border rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-border bg-card shrink-0">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-3 text-sm font-semibold rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={applyFilters}
                    className="flex-[2] py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>

            </div>
          </div>,
          document.body
        )}

      </div>
    </Layout>
  );
};

// --- Updated Category Pill ---
interface CategoryPillProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  special?: boolean;
  disabledLook?: boolean;
}

const CategoryPill = ({ active, onClick, icon, label, special, disabledLook }: CategoryPillProps) => (
  <button
    onClick={!disabledLook ? onClick : undefined} // Disable click if empty
    disabled={disabledLook}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border
      ${disabledLook 
        ? 'opacity-40 bg-muted/10 border-transparent text-muted-foreground cursor-not-allowed grayscale' // Fully greyed out look
        : active 
          ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105' 
          : 'bg-card text-foreground border-border hover:border-primary/30 hover:bg-muted/40'
      }
      ${special && !active && !disabledLook ? 'text-amber-500 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10' : ''}
    `}
  >
    <span className={`w-5 h-5 flex items-center justify-center shrink-0 overflow-hidden ${active && !special ? 'brightness-0 invert' : ''}`}>
      {icon}
    </span>
    <span>{label}</span>
    {/* Optional: Show 0 count if you want, or just leave it clean */}
  </button>
);

export default ProductsPage;

