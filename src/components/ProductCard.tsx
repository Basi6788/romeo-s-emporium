import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col gap-3 group cursor-pointer"
    >
      <div className="aspect-[4/5] w-full rounded-[2rem] bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 overflow-hidden relative p-6 flex items-center justify-center transition-all duration-300 group-hover:shadow-xl dark:group-hover:shadow-primary/20">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
        />
      </div>
      <div className="px-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{product.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium">${product.price.toFixed(2)}</p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
