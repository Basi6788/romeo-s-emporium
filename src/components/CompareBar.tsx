import React, { useRef, useEffect } from 'react';
import { X, GitCompare } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import gsap from 'gsap';

const CompareBar: React.FC = () => {
  const { compareItems, removeFromCompare, setCompareOpen } = useCompare();
  const barRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (barRef.current && compareItems.length > 0) {
      gsap.fromTo(barRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, [compareItems.length > 0]);

  useEffect(() => {
    itemsRef.current.forEach((item, index) => {
      if (item && compareItems[index]) {
        gsap.fromTo(item,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, delay: index * 0.1, ease: 'back.out(2)' }
        );
      }
    });
  }, [compareItems.length]);

  if (compareItems.length === 0) return null;

  return (
    <div
      ref={barRef}
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border">
        {/* Product thumbnails */}
        <div className="flex items-center gap-2">
          {compareItems.map((item, index) => (
            <div
              key={item.id}
              ref={el => itemsRef.current[index] = el}
              className="relative group"
            >
              <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden border-2 border-primary/20">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <button
                onClick={() => removeFromCompare(item.id)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {/* Empty slots */}
          {[...Array(4 - compareItems.length)].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-12 h-12 rounded-xl border-2 border-dashed border-border flex items-center justify-center"
            >
              <span className="text-muted-foreground text-xs">+</span>
            </div>
          ))}
        </div>

        {/* Compare button */}
        <button
          onClick={() => setCompareOpen(true)}
          disabled={compareItems.length < 2}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            compareItems.length >= 2
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          Compare ({compareItems.length})
        </button>
      </div>
    </div>
  );
};

export default CompareBar;