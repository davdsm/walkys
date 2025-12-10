import type { FC } from "react";
import { motion } from "framer-motion";
import { isNumber } from "mathjs";
import { ParallaxBanner } from "react-scroll-parallax";

export interface CardProps {
  image: string;
  title: string;
  description: string;
  alt?: string;
  index?: number;
}

export const Card: FC<CardProps> = ({
  image,
  title,
  description,
  alt = title,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.6, once: true }}
      transition={{
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
        delay: isNumber(index) ? index * 0.7 : 0.8,
      }}
      className="w-1/2 flex flex-col bg-white rounded-md overflow-hidden h-full p-md"
    >
      {/* Image Container */}
      <div className="w-full h-30 md:h-56 overflow-hidden bg-white p-4">
        <ParallaxBanner
          layers={[{ image: image, speed: -9 }]}
          aria-label={alt}
          className="w-full h-full object-cover rounded"
        />
      </div>

      {/* Content Container */}
      <div className="flex flex-col px-4 pb-6 md:px-8 flex-grow">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h3>
        <p className="text-sm md:text-lg text-gray-600 leading-relaxed flex-grow">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default Card;
