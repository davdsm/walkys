import { motion } from "framer-motion";
import { Link } from "react-router";
import { Breadcrumbs } from "./Breadcrumbs";
import { ProductActions } from "./ProductActions";
import { getMediaType } from "~/lib/utils";

interface MobileProductLayoutProps {
  productName: string;
  productDescription: string;
  productDetails: string;
  collectionName: string;
  media: string[];
  selectedImage: number;
  onImageSelect: (index: number) => void;
  sizes: string[];
  selectedSize: string | null;
  onSizeSelect: (size: string) => void;
  onOrder: () => void;
  breadcrumbs: Array<{ label: string; to: string | null; active?: boolean }>;
  language: string;
}

export const MobileProductLayout = ({
  productName,
  productDescription,
  productDetails,
  collectionName,
  media,
  selectedImage,
  onImageSelect,
  sizes,
  selectedSize,
  onSizeSelect,
  onOrder,
  breadcrumbs,
  language,
}: MobileProductLayoutProps) => {
  return (
    <div className="md:hidden min-h-screen bg-[#f1f1f1]">
      {/* Full Screen Image Section (70% height) */}
      <div className="h-[70vh] w-full relative bg-[#f1f1f1] flex items-center justify-center p-6">
        {media[selectedImage] &&
          (getMediaType(media[selectedImage]) === "video" ? (
            <motion.video
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={media[selectedImage]}
              className="w-full h-full object-contain"
              controls
              loop
              muted
              playsInline
            />
          ) : (
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={media[selectedImage]}
              alt={productName}
              className="w-full h-full object-contain"
            />
          ))}

        {/* Size Selector - Square Buttons Overlaid at Bottom */}
        {sizes.length > 0 && (
          <div className="absolute bottom-16 left-0 w-full flex justify-center gap-2 px-6 flex-wrap">
            {sizes.map((size) => (
              <button
                key={`size-square-${size}`}
                onClick={() => onSizeSelect(size)}
                className={`w-12 h-12 flex items-center justify-center text-sm font-medium transition-all rounded-sm ${
                  selectedSize === size
                    ? "bg-white text-black"
                    : "bg-[#F9F9F9]/60 text-black"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Section (White card) */}
      <div className="bg-white rounded-t-[40px] -mt-10 relative z-20 min-h-[50vh] p-8 pb-32">
        {/* Breadcrumbs */}
        <Breadcrumbs breadcrumbs={breadcrumbs} />

        {/* Collection Name */}
        {collectionName && (
          <p className="text-sm text-neutral-500 mb-2 lowercase font-light">
            {collectionName}
          </p>
        )}

        {/* Product Name */}
        <h1 className="text-2xl font-bold text-black mb-6">{productName}</h1>

        {/* Thumbnail Gallery */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {media.map((url, index) => {
            const isVideo = getMediaType(url) === "video";
            return (
              <button
                key={`mobile-thumb-${index}`}
                type="button"
                onClick={() => onImageSelect(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-sm overflow-hidden border-2 transition-all bg-[#f9f9f9] ${
                  selectedImage === index
                    ? "border-black"
                    : "border-transparent"
                }`}
              >
                {isVideo ? (
                  <video
                    src={url}
                    className="w-full h-full object-contain"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={url}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons Row */}
        <ProductActions
          onBack={() => {}}
          onOrder={onOrder}
          language={language}
          variant="mobile"
        />

        {/* Info Section */}
        <div className="space-y-4 mb-10">
          <h2 className="text-lg font-bold text-black border-none">
            {language === "pt"
              ? "Informação do Produto"
              : "Product Information"}
          </h2>
          <p className="text-neutral-600 leading-relaxed text-sm">
            {productDescription}
          </p>
        </div>

        {/* Details Section */}
        {productDetails && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black border-none">
              {language === "pt" ? "Detalhes do Produto" : "Product Details"}
            </h2>
            <div
              className="text-neutral-600 text-sm leading-relaxed prose prose-neutral prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: productDetails }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
