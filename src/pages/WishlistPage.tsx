import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const WishlistPage: React.FC = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

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

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Heart className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-8">
            Save items you love by clicking the heart icon.
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Discover Products <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="section-title mb-8">My Wishlist</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-card rounded-2xl overflow-hidden border border-border/50 card-hover"
            >
              <div className="relative aspect-square bg-muted p-4">
                <Link to={`/products/${item.productId}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(item.productId)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-card/90 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <Link
                  to={`/products/${item.productId}`}
                  className="font-semibold hover:text-primary transition-colors line-clamp-2 block"
                >
                  {item.name}
                </Link>
                <p className="text-lg font-bold">${item.price.toFixed(2)}</p>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default WishlistPage;
