import { motion } from "framer-motion";
import { getMediaType } from "~/lib/utils";

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
  const selectedUrl = media[selectedImage];
  const selectedIsVideo = selectedUrl ? getMediaType(selectedUrl) === "video" : false;

  return (
    <div className="w-full relative h-full">
      {/* Main Image or Video */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-white"
      >
        {selectedUrl &&
          (selectedIsVideo ? (
            <video
              src={selectedUrl}
              className="w-full h-full object-contain"
              controls
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={selectedUrl}
              alt={productName}
              className="w-full h-full object-contain"
              loading="eager"
              decoding="async"
            />
          ))}
      </motion.div>

      {/* Thumbnail Gallery - Overlaid at Bottom */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-10 transition-all">
        {media.map((url: string, index: number) => {
          const isVideo = getMediaType(url) === "video";
          return (
            <motion.button
              key={`thumb-${index}`}
              type="button"
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
              {isVideo ? (
                <video
                  src={url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={url}
                  alt={`${productName} ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
