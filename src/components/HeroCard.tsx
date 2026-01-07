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
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // GSAP Animations for card entrance/exit
  useEffect(() => {
    if (!cardRef.current || !contentRef.current || !imageRef.current) return;

    // Kill old tweens
    gsap.killTweensOf([
      cardRef.current,
      imageRef.current,
      contentRef.current.children,
    ]);

    if (isActive) {
      // ENTER ANIMATION
      gsap.set(cardRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        zIndex: 10,
      });

      gsap.set(contentRef.current.children, {
        y: 60,
        opacity: 0,
      });

      gsap.set(imageRef.current, {
        scale: 1.3,
        filter: 'brightness(0.8) blur(5px)',
      });

      gsap.set(buttonRef.current, {
        scale: 0.9,
        opacity: 0,
      });

      const tl = gsap.timeline();

      // Image animation
      tl.to(imageRef.current, {
        scale: 1,
        filter: 'brightness(1) blur(0px)',
        duration: 2,
        ease: 'power3.out',
      }, 0);

      // Content animation with stagger
      tl.to(contentRef.current.children, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power4.out',
        delay: 0.3,
      }, 0.2);

      // Button animation
      tl.to(buttonRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'back.out(1.7)',
      }, 0.8);

      // Subtle float animation for button
      gsap.to(buttonRef.current, {
        y: -5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5,
      });

    } else {
      // EXIT ANIMATION
      const tl = gsap.timeline();
      
      tl.to(cardRef.current, {
        opacity: 0,
        scale: 0.95,
        y: -30,
        duration: 0.7,
        ease: 'power3.inOut',
        zIndex: 0,
      });
      
      tl.to(imageRef.current, {
        scale: 1.1,
        filter: 'brightness(0.7) blur(3px)',
        duration: 0.5,
        ease: 'power2.in',
      }, 0);
    }
  }, [isActive]);

  // Scroll-based animations
  useEffect(() => {
    if (!cardRef.current || !isActive) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 300;
      const progress = Math.min(scrollY / maxScroll, 1);
      
      if (progress > 0) {
        // Fade out effect based on scroll
        gsap.to(cardRef.current, {
          opacity: 1 - progress * 0.8,
          scale: 1 - progress * 0.1,
          y: -progress * 50,
          duration: 0.3,
        });
        
        // Parallax effect on image
        gsap.to(imageRef.current, {
          y: progress * 30,
          scale: 1 + progress * 0.1,
          duration: 0.3,
        });
        
        // Content fade out
        if (contentRef.current) {
          gsap.to(contentRef.current.children, {
            opacity: 1 - progress * 1.5,
            y: progress * 40,
            duration: 0.3,
            stagger: 0.05,
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial call
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isActive]);

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 w-full h-full will-change-transform"
      style={{
        opacity: isActive ? 1 : 0,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* IMAGE with parallax container */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            ref={imageRef}
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            loading={isActive ? 'eager' : 'lazy'}
            style={{
              transformOrigin: 'center center',
            }}
          />
        </div>

        {/* OVERLAYS with gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
        <div
          className={`absolute inset-0 bg-gradient-to-r ${
            slide.gradient || 'from-primary/40 via-purple-900/30 to-transparent'
          } mix-blend-overlay transition-all duration-1000`}
          style={{
            opacity: isActive ? 1 : 0.5,
          }}
        />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>

        {/* CONTENT with 3D depth effect */}
        <div className="absolute inset-0 flex items-center md:items-end pb-12 md:pb-24 px-6 md:px-12 container mx-auto">
          <div 
            ref={contentRef} 
            className="max-w-3xl space-y-6 md:space-y-8 relative z-10"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Badge with animation */}
            {slide.badge && (
              <div 
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 transform-gpu"
                style={{
                  transform: 'translateZ(20px)',
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-sm font-bold text-white tracking-wide">
                  {slide.badge}
                </span>
              </div>
            )}

            {/* Title with 3D effect */}
            <h1 
              ref={titleRef}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-2xl"
              style={{
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                transform: 'translateZ(40px)',
              }}
            >
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p 
              ref={subtitleRef}
              className="text-lg sm:text-xl md:text-2xl text-gray-300 font-medium max-w-xl leading-relaxed drop-shadow-lg"
              style={{
                transform: 'translateZ(30px)',
              }}
            >
              {slide.subtitle}
            </p>

            {/* Button with floating animation */}
            <div 
              ref={buttonRef}
              className="pt-4 transform-gpu"
              style={{
                transform: 'translateZ(50px)',
              }}
            >
              <Button
                asChild
                size="lg"
                className="group h-14 px-10 text-lg rounded-full bg-gradient-to-r from-white to-gray-100 text-black hover:from-gray-100 hover:to-white shadow-[0_0_50px_-12px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.6)] transition-all duration-300 hover:scale-105"
              >
                <Link to={slide.link} className="flex items-center gap-2">
                  Shop Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator (only for active card) */}
        {isActive && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex flex-col items-center gap-2">
              <span className="text-white/70 text-sm font-medium tracking-wider">
                SCROLL
              </span>
              <div className="w-px h-8 bg-gradient-to-b from-white/80 to-transparent animate-bounce" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroCard;