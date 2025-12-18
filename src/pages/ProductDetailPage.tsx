import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus, Star, Truck, Shield, RotateCcw, Check, Box } from 'lucide-react';
import { gsap } from 'gsap';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import Product3DViewer from '@/components/Product3DViewer';
import ProductReviews from '@/components/ProductReviews';
import { products } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const product = products.find(p => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, [id]);

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Browse Products
          </button>
        </div>
      </Layout>
    );
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      color: product.colors?.[selectedColor]
    });
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      color: product.colors?.[selectedColor]
    });
    navigate('/checkout');
  };

  const handleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });
      toast.success('Added to wishlist!');
    }
  };

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <Layout>
      <div ref={contentRef} className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images / 3D Viewer */}
          <div className="space-y-4">
            {show3D ? (
              <div className="relative">
                <Product3DViewer 
                  productImage={product.image} 
                  color={product.colors?.[selectedColor] || '#8B5CF6'} 
                />
                <button
                  onClick={() => setShow3D(false)}
                  className="absolute top-4 right-4 px-4 py-2 rounded-xl glass-liquid text-sm font-medium hover:bg-primary/10 transition-colors"
                >
                  View Image
                </button>
              </div>
            ) : (
              <div className="relative aspect-square bg-gradient-to-br from-muted/50 to-muted rounded-3xl overflow-hidden border border-border/30">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-8 animate-float"
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4 px-4 py-2 rounded-2xl bg-rose text-primary-foreground font-bold text-sm">
                    -{discount}% OFF
                  </div>
                )}
                <button
                  onClick={() => setShow3D(true)}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl glass-liquid text-sm font-medium hover:bg-primary/10 transition-colors"
                >
                  <Box className="w-4 h-4" />
                  View in 3D
                </button>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald/10 text-emerald text-xs font-semibold uppercase tracking-wide mb-3">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-balance">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber text-amber'
                          : 'fill-muted text-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-amber">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-4xl font-display font-bold text-emerald">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Select Color</h3>
                <div className="flex gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`w-12 h-12 rounded-2xl border-2 transition-all duration-300 ${
                        selectedColor === index
                          ? 'border-primary ring-4 ring-primary/20 scale-110'
                          : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center glass-liquid rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-4 hover:bg-muted transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-14 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-4 hover:bg-muted transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span>
                  {product.inStock ? (
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald/10 text-emerald font-medium">
                      <Check className="w-4 h-4" /> In Stock
                    </span>
                  ) : (
                    <span className="px-4 py-2 rounded-full bg-rose/10 text-rose font-medium">Out of Stock</span>
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleAddToCart} 
                className="flex-1 btn-secondary flex items-center justify-center gap-3 py-4"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button 
                onClick={handleBuyNow} 
                className="flex-1 btn-primary py-4 font-bold"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlist}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                  isInWishlist(product.id)
                    ? 'bg-rose border-rose text-primary-foreground'
                    : 'border-border hover:border-rose hover:text-rose'
                }`}
              >
                <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/50">
              {[
                { icon: Truck, label: 'Free Shipping', color: 'text-emerald' },
                { icon: Shield, label: '2 Year Warranty', color: 'text-violet' },
                { icon: RotateCcw, label: 'Easy Returns', color: 'text-amber' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex flex-col items-center gap-3 text-center p-4 rounded-2xl bg-muted/30">
                  <div className={`w-12 h-12 rounded-2xl bg-background flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-20">
          <div className="flex gap-2 border-b border-border/50 overflow-x-auto pb-px">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold capitalize transition-all duration-300 border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="py-10">
            {activeTab === 'description' && (
              <div className="max-w-3xl animate-fade-in">
                <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="animate-fade-in">
                <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
                  {[
                    { label: 'Brand', value: 'BASITSHOP' },
                    { label: 'Model', value: product.name },
                    { label: 'Category', value: product.category },
                    { label: 'Warranty', value: '2 Years' },
                    { label: 'Return Policy', value: '30 Days' },
                    { label: 'Stock Status', value: product.inStock ? 'In Stock' : 'Out of Stock' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between p-4 rounded-xl bg-muted/30">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <ProductReviews 
                productId={product.id} 
                productRating={product.rating} 
                reviewCount={product.reviews} 
              />
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="section-title mb-10">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;