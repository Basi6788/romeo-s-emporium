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
    if (isActive && cardRef.current && contentRef.current && imageRef.current) {
      // 1. Reset Content & Image
      gsap.set(contentRef.current.children, { y: 50, opacity: 0 });
      gsap.set(imageRef.current, { scale: 1.2 }); // Start slightly zoomed in

      // 2. Animate Content (Staggered Fade Up)
      gsap.to(contentRef.current.children, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2
      });

      // 3. Animate Image (Slow Zoom Out effect)
      gsap.to(imageRef.current, {
        scale: 1,
        duration: 6, // Long duration for smooth effect
        ease: 'power2.out'
      });
    }
  }, [isActive]);

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
      }`}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* Optimized Image with Ref for Animation */}
        <img
          ref={imageRef}
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading={isActive ? 'eager' : 'lazy'}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient || 'from-primary/30 to-purple-900/30'} mix-blend-soft-light`} />

        {/* Content */}
        <div className="absolute inset-0 flex items-center md:items-end pb-12 md:pb-24 px-6 md:px-12 container mx-auto">
          <div ref={contentRef} className="max-w-3xl space-y-6 md:space-y-8">
            {slide.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-spin-slow" />
                <span className="text-sm font-bold text-white tracking-wide">{slide.badge}</span>
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
                <Link to={slide.link}>
                    Shop Now
                </Link>
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCard;
