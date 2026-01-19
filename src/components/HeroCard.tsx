import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
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
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || !contentRef.current || !imageRef.current) return;

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out', overwrite: 'auto' }
    });

    if (isActive) {
      gsap.set(cardRef.current, { opacity: 1, scale: 1, zIndex: 10, y: 0 });
      gsap.set([contentRef.current.children, buttonRef.current], { clearProps: 'all' });
      gsap.set(imageRef.current, { scale: 1.15, opacity: 0.8 });

      tl.to(imageRef.current, { scale: 1, opacity: 1, duration: 1.8, ease: 'expo.out' }, 0)
        .fromTo(contentRef.current.children, 
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power4.out' }, 0.4)
        .fromTo(buttonRef.current,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.2)' }, 0.8);

      gsap.to(buttonRef.current, { y: -4, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    } else {
      tl.to(cardRef.current, { opacity: 0, duration: 0.6, ease: 'power2.inOut', zIndex: 0 }, 0)
        .to(imageRef.current, { scale: 1.05, opacity: 0.6, duration: 0.5 }, 0);
    }

    return () => {
      tl.kill();
      gsap.killTweensOf([cardRef.current, imageRef.current, buttonRef.current]);
    };
  }, [isActive]);

  return (
    <div ref={cardRef} className="absolute inset-0 w-full h-full will-change-transform opacity-0 overflow-hidden">
      <div className="relative w-full h-full">
        {/* Desktop Optimization: object-top ensures faces/top parts aren't cut */}
        <div className="absolute inset-0">
          <img
            ref={imageRef}
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-top md:object-center will-change-transform"
            loading={isActive ? 'eager' : 'lazy'}
          />
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient || 'from-primary/30 via-transparent to-transparent'} mix-blend-overlay`} />

        {/* Content */}
        <div className="absolute inset-0 flex items-center md:items-end pb-16 md:pb-28 px-6 md:px-16 container mx-auto">
          <div ref={contentRef} className="max-w-4xl space-y-6 md:space-y-8 relative z-10">
            {slide.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-lg border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-xs md:text-sm font-bold text-white uppercase tracking-widest">{slide.badge}</span>
              </div>
            )}
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white leading-[1] tracking-tighter uppercase italic">
              {slide.title}
            </h1>
            <p className="text-lg md:text-2xl text-gray-200 font-medium max-w-2xl leading-tight opacity-90">
              {slide.subtitle}
            </p>
            <div ref={buttonRef} className="pt-2">
              <Button asChild size="lg" className="h-14 md:h-16 px-10 md:px-14 text-lg md:text-xl rounded-full bg-white text-black hover:bg-gray-100 transition-all duration-300 shadow-2xl">
                <Link to={slide.link} className="flex items-center gap-3 font-bold">
                  Shop Now <ArrowRight className="w-6 h-6" />
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

