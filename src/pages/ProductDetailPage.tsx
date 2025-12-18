import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus, Star, Truck, Shield, RotateCcw, Check, Box, Loader2 } from 'lucide-react';
import { gsap } from 'gsap';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import Product3DViewer from '@/components/Product3DViewer';
import ProductReviews from '@/components/ProductReviews';
import { useProduct, useProducts } from '@/hooks/useApi';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProducts = [] } = useProducts();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    if (contentRef.current && product) {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, [product]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <button onClick={() => navigate('/products')} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg">
            Browse Products
          </button>
        </div>
      </Layout>
    );
  }

  const relatedProducts = allProducts
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
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {show3D ? (
              <div className="relative">
                <Product3DViewer 
                  productImage={product.image} 
                  color={product.colors?.[selectedColor] || '#8B5CF6'} 
                />
                <button
                  onClick={() => setShow3D(false)}
                  className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-background/80 backdrop-blur-sm text-sm font-medium"
                >
                  View Image
                </button>
              </div>
            ) : (
              <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-rose-500 text-white font-bold text-sm">
                    -{discount}%
                  </div>
                )}
                <button
                  onClick={() => setShow3D(true)}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-background/80 backdrop-blur-sm text-sm font-medium"
                >
                  <Box className="w-4 h-4" />
                  3D View
                </button>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="text-sm text-primary font-medium uppercase tracking-wide">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold mt-2 mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground text-sm">({product.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Color</h3>
                <div className="flex gap-2">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${
                        selectedColor === index ? 'border-primary scale-110' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-medium mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-muted rounded-xl">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="flex items-center gap-1.5 text-sm text-emerald-500">
                  <Check className="w-4 h-4" /> In Stock
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-muted rounded-xl font-medium hover:bg-muted/80 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button onClick={handleBuyNow} className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
                Buy Now
              </button>
              <button
                onClick={handleWishlist}
                className={`p-3 rounded-xl border-2 transition-all ${
                  isInWishlist(product.id) ? 'bg-rose-500 border-rose-500 text-white' : 'border-border hover:border-rose-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border/50">
              {[
                { icon: Truck, label: 'Free Shipping' },
                { icon: Shield, label: '2 Year Warranty' },
                { icon: RotateCcw, label: 'Easy Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center p-3 rounded-xl bg-muted/50">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex gap-1 border-b border-border/50">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize border-b-2 -mb-px transition-colors ${
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <p className="text-muted-foreground max-w-2xl">{product.description || 'No description available.'}</p>
            )}
            {activeTab === 'specifications' && (
              <div className="grid md:grid-cols-2 gap-3 max-w-2xl">
                {[
                  { label: 'Brand', value: 'BASITSHOP' },
                  { label: 'Category', value: product.category },
                  { label: 'Warranty', value: '2 Years' },
                  { label: 'Return Policy', value: '30 Days' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <ProductReviews productId={product.id} productRating={product.rating || 4.5} reviewCount={product.reviews || 0} />
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
