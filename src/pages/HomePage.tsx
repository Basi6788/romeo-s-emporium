import { useRef, useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Truck, Shield, Headphones, Clock, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
import { useTracking } from '@/hooks/useTracking';
import { Button } from '@/components/ui/button';
import ProductLoader from '@/components/Loaders/ProductLoader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSwipeable } from 'react-swipeable';

const ParticleBackground = lazy(() => import('@/components/ParticleBackground'));
const HeroCard = lazy(() => import('@/components/HeroCard'));

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------- */
/* Scroll to top FIX (footer landing bug) */
/* ---------------------------------- */
const ScrollToTopFix = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
};

/* ---------------------------------- */
/* Skeletons */
/* ---------------------------------- */
const HeroSkeleton = () => (
  <div className="w-full h-[500px] md:h-[600px] bg-muted animate-pulse" />
);

const ProductSkeletonCard = () => (
  <div className="bg-card rounded-2xl border p-4">
    <div className="aspect-square bg-muted rounded-xl mb-4 animate-pulse" />
    <div className="h-4 bg-muted rounded w-3/4 mb-2 animate-pulse" />
    <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
  </div>
);

/* ---------------------------------- */
/* Swipe Wrapper */
/* ---------------------------------- */
const SwipeWrapper = ({ onNext, onPrev, children }) => {
  const handlers = useSwipeable({
    onSwipedLeft: onNext,
    onSwipedRight: onPrev,
    trackMouse: true,
    delta: 40,
    preventScrollOnSwipe: true,
  });

  return (
    <div {...handlers} className="h-full w-full touch-pan-y">
      {children}
    </div>
  );
};

/* ---------------------------------- */
/* MAIN PAGE */
/* ---------------------------------- */
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const { trackInteraction, getRecommendations } = useTracking();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: dbHeroImages = [], isLoading: heroLoading } = useHeroImages();

  /* ---------------------------------- */
  /* HERO SLIDES */
  /* ---------------------------------- */
  const heroSlides = useMemo(() => {
    return dbHeroImages?.length
      ? dbHeroImages
      : [
          {
            id: '1',
            image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da',
            title: 'Premium Collection',
            subtitle: 'Trending products only',
            link: '/products',
          },
          {
            id: '2',
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
            title: 'Summer Sale',
            subtitle: 'Up to 60% off',
            link: '/products',
          },
        ];
  }, [dbHeroImages]);

  /* ---------------------------------- */
  /* IMAGE PRELOAD */
  /* ---------------------------------- */
  useEffect(() => {
    Promise.all(
      heroSlides.map(
        s =>
          new Promise(res => {
            const i = new Image();
            i.src = s.image;
            i.onload = res;
          })
      )
    ).finally(() => setLoading(false));
  }, [heroSlides]);

  /* ---------------------------------- */
  /* SLIDE ANIMATION */
  /* ---------------------------------- */
  const animateSlide = useCallback(
    (dir: 1 | -1) => {
      if (!sliderRef.current) return;

      gsap.fromTo(
        sliderRef.current.children[currentSlide],
        { xPercent: dir * 30, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
    },
    [currentSlide]
  );

  const nextSlide = useCallback(() => {
    setCurrentSlide(s => {
      const n = (s + 1) % heroSlides.length;
      animateSlide(1);
      return n;
    });
  }, [heroSlides.length, animateSlide]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(s => {
      const p = (s - 1 + heroSlides.length) % heroSlides.length;
      animateSlide(-1);
      return p;
    });
  }, [heroSlides.length, animateSlide]);

  /* ---------------------------------- */
  /* AUTO SLIDE */
  /* ---------------------------------- */
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = setInterval(nextSlide, 6000);
    return () => clearInterval(id);
  }, [nextSlide, heroSlides.length]);

  /* ---------------------------------- */
  /* GSAP SECTION FIXES */
  /* ---------------------------------- */
  useEffect(() => {
    ScrollTrigger.getAll().forEach(t => t.kill());

    gsap.utils.toArray('.fade-in').forEach((el: any) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          },
        }
      );
    });

    ScrollTrigger.refresh();
  }, []);

  /* ---------------------------------- */
  /* PRODUCTS */
  /* ---------------------------------- */
  const featuredProducts = useMemo(
    () => (products.length ? getRecommendations(products) : []),
    [products, getRecommendations]
  );

  if (loading) {
    return (
      <Layout>
        <ProductLoader />
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollToTopFix />

      {/* HERO */}
      <section ref={heroRef} className="relative h-[500px] md:h-[600px] mb-16">
        <Suspense fallback={null}>
          <ParticleBackground />
        </Suspense>

        {heroLoading ? (
          <HeroSkeleton />
        ) : (
          <SwipeWrapper onNext={nextSlide} onPrev={prevSlide}>
            <div ref={sliderRef} className="h-full w-full relative overflow-hidden">
              {heroSlides.map((slide, i) => (
                <Suspense key={slide.id} fallback={<HeroSkeleton />}>
                  <HeroCard slide={slide} isActive={i === currentSlide} />
                </Suspense>
              ))}
            </div>
          </SwipeWrapper>
        )}
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 fade-in">
        {[Truck, Shield, Clock, Headphones].map((Icon, i) => (
          <div key={i} className="bg-card border rounded-2xl p-6 text-center">
            <Icon className="mx-auto mb-3" />
            <p className="font-semibold">Premium Service</p>
          </div>
        ))}
      </section>

      {/* PRODUCTS */}
      <section className="container mx-auto px-4 py-20 fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {productsLoading
            ? [...Array(8)].map((_, i) => <ProductSkeletonCard key={i} />)
            : featuredProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="cursor-pointer"
                >
                  <ProductCard product={p} />
                </div>
              ))}
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;