import { useRef, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import HeroCard from '@/components/HeroCard';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useProducts } from '@/hooks/useApi';
import { useHeroImages } from '@/hooks/useHeroImages';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSwipeable } from 'react-swipeable';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const { data: heroSlides = [] } = useHeroImages();

  /* HERO SCROLL FADE */
  useEffect(() => {
    if (!heroRef.current) return;

    ScrollTrigger.create({
      trigger: heroRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        gsap.to(heroRef.current, {
          opacity: 1 - self.progress,
          y: -self.progress * 120,
          ease: 'none',
        });
      },
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  /* SLIDE CHANGE */
  const goTo = useCallback(
    (index: number) => {
      if (animating || index === current) return;
      setAnimating(true);

      const slides = sliderRef.current?.children;
      if (!slides) return;

      const currentEl = slides[current] as HTMLElement;
      const nextEl = slides[index] as HTMLElement;

      gsap.timeline({
        onComplete: () => {
          setCurrent(index);
          setAnimating(false);
        },
      })
      .to(currentEl, {
        opacity: 0,
        y: -60,
        scale: 0.96,
        duration: 0.6,
        ease: 'power3.inOut',
      })
      .fromTo(
        nextEl,
        { opacity: 0, y: 80, scale: 1.03 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.25'
      );
    },
    [current, animating]
  );

  const next = () => goTo((current + 1) % heroSlides.length);
  const prev = () =>
    goTo((current - 1 + heroSlides.length) % heroSlides.length);

  /* SWIPE */
  const swipeHandlers = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
  });

  /* AUTO SLIDE */
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [current, heroSlides.length]);

  return (
    <Layout>
      {/* HERO */}
      <section
        ref={heroRef}
        {...swipeHandlers}
        className="relative h-[500px] md:h-[650px] overflow-hidden"
      >
        <div ref={sliderRef} className="absolute inset-0">
          {heroSlides.map((slide, i) => (
            <HeroCard
              key={slide.id}
              slide={slide}
              isActive={i === current}
            />
          ))}
        </div>

        {/* DOTS */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              New Arrivals
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Trending Products
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto">
            Products people actually want, not filler.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.slice(0, 8).map((p) => (
            <div
              key={p.id}
              className="cursor-pointer"
              onClick={() => navigate(`/product/${p.id}`)}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Button asChild size="lg" className="rounded-full px-10">
            <Link to="/products">Explore Store</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;