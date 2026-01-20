import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, Star, ShoppingBag, X } from 'lucide-react';
import { gsap } from 'gsap';
import Layout from '@/components/Layout';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const WishlistPage: React.FC = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation for entering items
  useEffect(() => {
    if (containerRef.current && items.length > 0) {
      gsap.fromTo('.wishlist-item',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [items.length]);

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
    removeFromWishlist(item.productId);
    toast.success('Added to cart!');
  };

  const handleAddAllToCart = () => {
    items.forEach(item => {
      addToCart({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1
      });
      removeFromWishlist(item.productId);
    });
    toast.success('All items moved to cart!');
  };

  // Empty State Design
  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10" />
            
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500/20 to-orange-500/20 flex items-center justify-center mb-6 animate-pulse">
              <Heart className="w-10 h-10 text-rose-500 fill-rose-500/50" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Your Wishlist is Empty
            </h1>
            <p className="text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
              Looks like you haven't found anything yet. Explore our exclusive collection and save your favorites here.
            </p>
            
            <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
              <Link to="/products">
                Start Shopping <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500 w-fit">
                My Wishlist
            </h1>
            <p className="text-muted-foreground mt-1">
                {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          
          <Button 
            onClick={handleAddAllToCart}
            className="w-full md:w-auto bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-lg"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Move All to Cart
          </Button>
        </div>

        {/* List Section (Rows instead of Grid) */}
        <div ref={containerRef} className="flex flex-col gap-4 max-w-4xl mx-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="wishlist-item group relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:bg-card"
            >
              {/* Product Image - Fixed Size on Left */}
              <div className="relative w-full sm:w-32 h-32 shrink-0 bg-muted/50 rounded-xl overflow-hidden">
                <Link to={`/products/${item.productId}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
              </div>

              {/* Product Info - Middle */}
              <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
                <Link
                  to={`/products/${item.productId}`}
                  className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
                >
                  {item.name}
                </Link>
                
                <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-muted-foreground font-medium">4.8 (120 reviews)</span>
                </div>

                <div className="mt-auto hidden sm:block">
                     <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">In Stock</span>
                </div>
              </div>

              {/* Actions & Price - Right Side */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2 w-full sm:w-auto justify-between sm:justify-center border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                 <div className="text-left sm:text-right">
                    <span className="text-xs text-muted-foreground block uppercase font-bold tracking-wider">Price</span>
                    <span className="text-xl font-bold text-foreground">
                        ${item.price.toFixed(2)}
                    </span>
                 </div>

                 <div className="flex items-center gap-2">
                    {/* Remove Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            removeFromWishlist(item.productId);
                            toast.success('Removed from wishlist');
                        }}
                        className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full"
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>

                    {/* Add to Cart Button */}
                    <Button
                        onClick={() => handleAddToCart(item)}
                        className="rounded-full px-6"
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                    </Button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default WishlistPage;

