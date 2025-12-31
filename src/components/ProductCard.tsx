import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext'; // Tumhara Auth Context
import { toast } from 'sonner';
import gsap from 'gsap';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  reviews?: number;
  description?: string;
  colors?: string[];
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
  index?: number; // Animation stagger ke liye
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth(); // Auth check ke liye
  const navigate = useNavigate();
  
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const bgGradientRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Dynamic Colors based on product (Optional: tum static bhi rakh sakte ho)
  // Image me Nike blue tha aur Puma purple, yahan hum random ya category base pick kar sakte hain
  const isPurple = index % 2 !== 0; 
  const gradientColor = isPurple ? 'from-purple-600 to-indigo-600' : 'from-blue-500 to-cyan-500';
  const shadowColor = isPurple ? 'group-hover:shadow-purple-500/30' : 'group-hover:shadow-cyan-500/30';
  const buttonColor = isPurple ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500';

  useEffect(() => {
    const card = cardRef.current;
    const image = imageRef.current;
    const glow = glowRef.current;
    const bg = bgGradientRef.current;

    if (!card || !image || !glow || !bg) return;

    // Initial Intro Animation
    gsap.fromTo(card, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.6, delay: index * 0.1, ease: 'power3.out' }
    );

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // 3D Tilt Math
      const rotateX = ((y - centerY) / centerY) * -15; // Max 15 deg rotation
      const rotateY = ((x - centerX) / centerX) * 15;

      // Card Tilt
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.05,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 1000,
        transformStyle: "preserve-3d"
      });

      // Parallax Effect on Image (Image moves opposite to tilt)
      gsap.to(image, {
        x: (x - centerX) * 0.1,
        y: (y - centerY) * 0.1,
        scale: 1.2,
        duration: 0.4,
        ease: 'power2.out'
      });

      // Parallax Background Blob
      gsap.to(bg, {
        x: (x - centerX) * 0.05,
        y: (y - centerY) * 0.05,
        duration: 0.4
      });

      // Neon Cursor Glow
      gsap.to(glow, {
        x: x,
        y: y,
        opacity: 0.6,
        duration: 0.2, // Quick follow
        ease: 'power1.out'
      });
    };

    const handleMouseLeave = () => {
      // Reset position
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)', // Bouncy reset
      });

      gsap.to(image, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power2.out'
      });

      gsap.to(bg, { x: 0, y: 0, duration: 0.6 });
      gsap.to(glow, { opacity: 0, duration: 0.4 });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [index]);

  // Main Action Handler (Auth Logic yahan hai)
  const handleAction = (e: React.MouseEvent, actionType: 'cart' | 'buy') => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Check Auth
    if (!isAuthenticated) {
        // Animation for rejection
        gsap.to(cardRef.current, {
            x: [0, -10, 10, -10, 10, 0], // Shake effect
            duration: 0.4,
            ease: 'power2.inOut'
        });

        toast.error("Login or Register First", {
            description: "You need to be logged in to shop.",
            duration: 3000,
        });
        
        // Redirect to Auth page
        navigate('/auth');
        return;
    }

    // 2. If Logged In -> Animate Button
    const btn = e.currentTarget;
    gsap.timeline()
      .to(btn, { scale: 0.8, duration: 0.1 })
      .to(btn, { scale: 1.2, duration: 0.1 })
      .to(btn, { scale: 1, duration: 0.2 });

    // 3. Perform Action
    if (actionType === 'cart') {
        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
        toast.success(
            <div className="flex items-center gap-2">
                <span className="text-lg">🛍️</span>
                <div>
                    <p className="font-bold">Added to Cart!</p>
                    <p className="text-xs opacity-80">{product.name}</p>
                </div>
            </div>
        );
    }
    // Buy Logic (Can be redirect to checkout)
    if (actionType === 'buy') {
       // navigate('/checkout'); // Example
       toast.success("Proceeding to Buy!");
    }
  };

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="perspective-1000 p-4"> {/* Perspective Container */}
      <Link to={`/products/${product.id}`} className="block group">
        <div 
          ref={cardRef}
          className={`
            relative w-full aspect-[3/4] rounded-3xl overflow-hidden 
            bg-[#1a1a1a] border border-white/10 
            transition-shadow duration-300 ${shadowColor}
            shadow-2xl
          `}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Neon Mouse Follow Glow */}
          <div 
            ref={glowRef}
            className={`absolute w-[150px] h-[150px] bg-gradient-to-r ${gradientColor} blur-[80px] rounded-full pointer-events-none opacity-0 z-0 mix-blend-screen`}
            style={{ transform: 'translate(-50%, -50%)', left: 0, top: 0 }}
          />

          {/* Dynamic Background Blob (Similar to image) */}
          <div 
            ref={bgGradientRef}
            className={`absolute top-[-20%] right-[-20%] w-[80%] h-[60%] bg-gradient-to-br ${gradientColor} rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 z-0`}
          />

          {/* Top Section: Discount & Image */}
          <div className="relative h-[65%] w-full z-10 p-4 flex flex-col justify-between">
            {/* Badge */}
            <div className="flex justify-between items-start transform translate-z-20">
              {discount > 0 && (
                 <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${gradientColor} shadow-lg`}>
                    -{discount}% OFF
                 </span>
              )}
              {/* Rating (Image style) */}
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-white">{product.rating || 4.5}</span>
              </div>
            </div>

            {/* Product Image - Full & Floating */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <img
                    ref={imageRef}
                    src={product.image}
                    alt={product.name}
                    className="w-[90%] h-[80%] object-contain drop-shadow-2xl z-20 will-change-transform"
                    style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }} 
                 />
            </div>
          </div>

          {/* Bottom Section: Info & Action */}
          <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-black/40 backdrop-blur-sm z-30 p-5 flex flex-col justify-between border-t border-white/5">
             
             {/* Text Content */}
             <div className="transform translate-z-10">
                <p className={`text-xs font-bold uppercase tracking-widest mb-1 text-transparent bg-clip-text bg-gradient-to-r ${gradientColor}`}>
                    {product.category || 'Wearables'}
                </p>
                <h3 className="text-white font-bold text-xl leading-tight truncate">
                    {product.name}
                </h3>
             </div>

             {/* Price & Add Button */}
             <div className="flex items-end justify-between mt-2 transform translate-z-20">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase font-medium">Price</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">
                            Rs. {product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                             <span className="text-xs text-gray-500 line-through decoration-red-500 decoration-2">
                                {product.originalPrice.toLocaleString()}
                             </span>
                        )}
                    </div>
                </div>

                {/* The Circular Button (Like Image) */}
                <button
                    ref={buttonRef}
                    onClick={(e) => handleAction(e, 'cart')}
                    className={`
                        w-12 h-12 rounded-full flex items-center justify-center 
                        ${buttonColor} text-white shadow-lg shadow-black/50
                        hover:scale-110 active:scale-90 transition-all duration-300
                        group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]
                    `}
                >
                    <Plus className="w-6 h-6 stroke-[3]" />
                </button>
             </div>
          </div>
          
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
