import { motion } from "framer-motion";

interface ProductImageGalleryProps {
  media: string[];
  selectedImage: number;
  onImageSelect: (index: number) => void;
  productName: string;
}

export const ProductImageGallery = ({
  media,
  selectedImage,
  onImageSelect,
  productName,
}: ProductImageGalleryProps) => {
  return (
    <div className="w-1/2 relative h-full">
      {/* Main Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-white"
      >
        {media[selectedImage] && (
          <img
            src={media[selectedImage]}
            alt={productName}
            className="w-full h-full object-contain p-8"
          />
        )}
      </motion.div>

      {/* Thumbnail Gallery - Overlaid at Bottom */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-10 transition-all">
        {media.map((img: string, index: number) => (
          <motion.button
            key={`thumb-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
            onClick={() => onImageSelect(index)}
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all bg-white ${
              selectedImage === index
                ? "border-black scale-110"
                : "border-transparent hover:border-black/20"
            }`}
          >
            <img
              src={img}
              alt={`${productName} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};
