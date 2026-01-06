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

  useEffect(() => {
    if (isActive && cardRef.current && contentRef.current) {
      // Reset before animation
      gsap.set(cardRef.current, { opacity: 1 });
      gsap.set(contentRef.current.children, { y: 20, opacity: 0 });
      
      // Stagger animation for content
      gsap.to(contentRef.current.children, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2
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
      <div className="relative w-full h-full">
        {/* Optimized Image */}
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading={isActive ? 'eager' : 'lazy'}
          fetchPriority={isActive ? 'high' : 'low'}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient || 'from-primary/20 to-secondary/20'} mix-blend-soft-light`} />

        {/* Content */}
        <div className="absolute inset-0 flex items-end pb-12 md:pb-24 px-6 md:px-12 container mx-auto">
          <div ref={contentRef} className="max-w-3xl space-y-6">
            {slide.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 animate-pulse">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-bold text-white">{slide.badge}</span>
              </div>
            )}
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
              {slide.title}
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 font-medium max-w-xl">
              {slide.subtitle}
            </p>
            
            <Button 
              asChild 
              size="lg" 
              className="h-14 px-8 text-lg rounded-full bg-white text-primary hover:bg-white/90 shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Link to={slide.link}>
                Shop Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCard;