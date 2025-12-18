import React, { useRef, useEffect } from 'react';
import { X, Star, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompare } from '@/contexts/CompareContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import gsap from 'gsap';

const CompareModal: React.FC = () => {
  const { compareItems, removeFromCompare, isCompareOpen, setCompareOpen, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCompareOpen && modalRef.current && backdropRef.current && contentRef.current) {
      document.body.style.overflow = 'hidden';
      
      gsap.fromTo(backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isCompareOpen]);

  const handleClose = () => {
    if (backdropRef.current && contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: 30,
        scale: 0.95,
        duration: 0.2,
        onComplete: () => setCompareOpen(false)
      });
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 });
    }
  };

  const handleAddToCart = (item: typeof compareItems[0]) => {
    addToCart({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
    toast.success(`${item.name} added to cart!`);
  };

  if (!isCompareOpen) return null;

  return (
    <div ref={modalRef} className="fixed inset-0 z-[100]">
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className="absolute inset-4 md:inset-8 flex items-center justify-center pointer-events-none">
        <div 
          ref={contentRef}
          className="w-full max-w-6xl max-h-full bg-background rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Compare Products</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {compareItems.length} of 4 products selected
              </p>
            </div>
            <div className="flex items-center gap-3">
              {compareItems.length > 0 && (
                <button
                  onClick={clearCompare}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {compareItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No products to compare</h3>
                <p className="text-muted-foreground mb-4">Add products to compare them side by side</p>
                <Link
                  to="/products"
                  onClick={handleClose}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  Browse Products
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground w-32">Feature</th>
                      {compareItems.map((item) => (
                        <th key={item.id} className="p-4 text-center">
                          <div className="relative">
                            <button
                              onClick={() => removeFromCompare(item.id)}
                              className="absolute -top-2 -right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors z-10"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <Link 
                              to={`/products/${item.id}`}
                              onClick={handleClose}
                              className="block"
                            >
                              <div className="w-32 h-32 mx-auto mb-3 rounded-2xl bg-muted overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-contain p-2"
                                />
                              </div>
                              <h3 className="font-semibold text-foreground text-sm line-clamp-2 hover:text-primary transition-colors">
                                {item.name}
                              </h3>
                            </Link>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-4 font-medium text-muted-foreground">Price</td>
                      {compareItems.map((item) => (
                        <td key={item.id} className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xl font-bold text-primary">${item.price.toFixed(2)}</span>
                            {item.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                ${item.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-muted-foreground">Rating</td>
                      {compareItems.map((item) => (
                        <td key={item.id} className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium text-foreground">{item.rating || 'N/A'}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-muted-foreground">Category</td>
                      {compareItems.map((item) => (
                        <td key={item.id} className="p-4 text-center">
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {item.category}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-muted-foreground">Discount</td>
                      {compareItems.map((item) => (
                        <td key={item.id} className="p-4 text-center">
                          {item.originalPrice ? (
                            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold">
                              -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-muted-foreground">Action</td>
                      {compareItems.map((item) => (
                        <td key={item.id} className="p-4 text-center">
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors text-sm"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;