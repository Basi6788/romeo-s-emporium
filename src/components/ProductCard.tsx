import { Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { useRef } from 'react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    rating: number;
    reviews: number;
    badge?: string;
    color: string;
  };
  onAddToCart: () => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || window.innerWidth < 768) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * 2;
    const rotateY = ((x - centerX) / centerX) * 2;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)'
    });
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Button bounce animation
    const button = e.currentTarget;
    gsap.to(button, {
      scale: 0.8,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
      onComplete: onAddToCart
    });

    // Product image pop animation
    const img = cardRef.current?.querySelector('.product-image');
    if (img) {
      gsap.to(img, {
        scale: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'elastic.out(1, 0.5)'
      });
    }
  };

  return (
    <div
      ref={cardRef}
      className="group relative bg-card rounded-3xl border overflow-hidden hover:shadow-2xl transition-all duration-300"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-4 left-4 z-20">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            product.badge === 'New' 
              ? 'bg-green-500 text-white' 
              : product.badge === 'Sale'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}>
            {product.badge}
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <div className={`absolute inset-0 ${product.color} opacity-20`} />
        <img
          src={product.image}
          alt={product.name}
          className="product-image relative w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {product.category}
          </span>
          <h3 className="text-lg font-semibold mt-1 line-clamp-1">{product.name}</h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </div>
            {product.originalPrice && product.originalPrice > 0 && (
              <div className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </div>
            )}
          </div>

          <Button
            data-product={product.id}
            size="icon"
            className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl"
            onClick={handleAddToCartClick}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default ProductCard;