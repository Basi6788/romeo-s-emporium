import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, Star } from 'lucide-react';
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

  useEffect(() => {
    if (containerRef.current && items.length > 0) {
      gsap.fromTo('.wishlist-item',
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.7)' }
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
    toast.success('All items added to cart!');
    toast.success('All items added to cart!');
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Your wishlist is empty</h1>
            <p className="text-muted-foreground mb-8">
              Save items you love by clicking the heart icon.
            </p>
            <Button asChild size="lg">
              <Link to="/products">
                Discover Products <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <p className="text-sm text-muted-foreground">{items.length} saved items</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAddAllToCart}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add All to Cart
            </Button>
          </div>
        </div>

        <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="wishlist-item group bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square bg-muted overflow-hidden">
                <Link to={`/products/${item.productId}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  />
                </Link>
                
                {/* Remove Button */}
                <button
                  onClick={() => {
                    removeFromWishlist(item.productId);
                    toast.success('Removed from wishlist');
                  }}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Wishlist Badge */}
                <div className="absolute top-3 left-3 p-2 rounded-xl bg-rose-500 text-white">
                  <Heart className="w-4 h-4 fill-current" />
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <Link
                  to={`/products/${item.productId}`}
                  className="font-medium text-sm hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]"
                >
                  {item.name}
                </Link>
                
                {/* Rating Placeholder */}
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">(4.0)</span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-primary">${item.price.toFixed(2)}</span>
                </div>

                <Button
                  onClick={() => handleAddToCart(item)}
                  className="w-full mt-3"
                  size="sm"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default WishlistPage;
