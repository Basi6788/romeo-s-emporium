import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules'; // Fade effect loops ke liye behtar rehta hai
import HeroCard from './HeroCard';

import 'swiper/css';
import 'swiper/css/effect-fade';

// Real-world Data for Marketplace
const slidesData = [
  {
    id: '1',
    // Nike/Sneaker vibes
    image: 'https://images.unsplash.com/photo-1556906781-9a412961d289?q=80&w=2000&auto=format&fit=crop', 
    title: 'Urban Stride',
    subtitle: 'Elevate your street game with the exclusive Air Series. Limited stock available for early birds.',
    badge: 'New Arrival',
    link: '/category/sneakers',
    gradient: 'from-orange-900/40'
  },
  {
    id: '2',
    // Tech/Headphones vibes
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2000&auto=format&fit=crop',
    title: 'Sonic Future',
    subtitle: 'Experience sound like never before with next-gen noise cancellation technology.',
    badge: 'Best Seller',
    link: '/category/electronics',
    gradient: 'from-blue-900/40'
  },
  {
    id: '3',
    // Fashion/Model vibes
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop',
    title: 'Vogue Season',
    subtitle: 'The winter collection is here. Premium fabrics designed for the modern aesthetic.',
    badge: 'Trending Now',
    link: '/category/fashion',
    gradient: 'from-purple-900/40'
  },
  {
    id: '4',
    // Luxury Car/Lifestyle vibes (Apki pasand ke hisaab se)
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2000&auto=format&fit=crop',
    title: 'Elite Drive',
    subtitle: 'Accessories and gear for the automotive enthusiast. Performance meets luxury.',
    badge: 'Premium',
    link: '/category/automotive',
    gradient: 'from-red-900/40'
  }
];

const HeroSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full h-screen relative bg-black">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect={'fade'} // "fade" ensures no white gaps between complex slides
        speed={1000}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        onRealIndexChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full h-full"
      >
        {slidesData.map((slide, index) => (
          <SwiperSlide key={slide.id} className="w-full h-full">
            <HeroCard slide={slide} isActive={activeIndex === index} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroSlider;

