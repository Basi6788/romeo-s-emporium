import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';

interface HeroCardProps {
  slide: {
    id: string;
    image: string;
    title: string;
    subtitle: string;
    badge?: string;
    link: string;
    gradient?: string;
  };
  isActive: boolean;
}

const HeroCard = ({ slide, isActive }: HeroCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!cardRef.current || !contentRef.current || !imageRef.current) return;

    // 🧠 KILL OLD TWEENS (VERY IMPORTANT)
    gsap.killTweensOf([
      cardRef.current,
      imageRef.current,
      contentRef.current.children,
    ]);

    if (isActive) {
      // 👉 ENTER SCENE
      gsap.set(cardRef.current, {
        opacity: 1,
        scale: 1,
        zIndex: 10,
      });

      gsap.set(contentRef.current.children, {
        y: 60,
        opacity: 0,
      });

      gsap.set(imageRef.current, {
        scale: 1.25,
      });

      const tl = gsap.timeline();

      tl.to(contentRef.current.children, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2,
      });

      tl.to(
        imageRef.current,
        {
          scale: 1,
          duration: 6,
          ease: 'power2.out',
        },
        0
      );
    } else {
      // 👋 EXIT SCENE (THIS WAS MISSING)
      gsap.to(cardRef.current, {
        opacity: 0,
        scale: 0.96,
        y: -40,
        duration: 0.6,
        ease: 'power3.inOut',
        zIndex: 0,
      });
    }
  }, [isActive]);

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 w-full h-full will-change-transform"
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* IMAGE */}
        <img
          ref={imageRef}
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading={isActive ? 'eager' : 'lazy'}
        />

        {/* OVERLAYS */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div
          className={`absolute inset-0 bg-gradient-to-r ${
            slide.gradient || 'from-primary/30 to-purple-900/30'
          } mix-blend-soft-light`}
        />

        {/* CONTENT */}
        <div className="absolute inset-0 flex items-center md:items-end pb-12 md:pb-24 px-6 md:px-12 container mx-auto">
          <div ref={contentRef} className="max-w-3xl space-y-6 md:space-y-8">
            {slide.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-spin-slow" />
                <span className="text-sm font-bold text-white tracking-wide">
                  {slide.badge}
                </span>
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
              {slide.title}
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 font-medium max-w-xl leading-relaxed">
              {slide.subtitle}
            </p>

            <div className="pt-4">
              <Button
                asChild
                size="lg"
                className="h-14 px-10 text-lg rounded-full bg-white text-black hover:bg-gray-200 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all duration-300"
              >
                <Link to={slide.link}>Shop Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCard;
