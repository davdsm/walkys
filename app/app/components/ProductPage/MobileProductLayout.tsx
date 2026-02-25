import { useMemo } from "react";
import { motion } from "framer-motion";
import { Breadcrumbs } from "./Breadcrumbs";
import { ProductActions } from "./ProductActions";
import { ThreeSixtyViewer } from "./ThreeSixtyViewer";
import { getMediaType } from "~/lib/utils";

type MediaSlot =
  | { type: "360"; frames: string[] }
  | { type: "image"; url: string };

function buildSlots(media360: string[], media: string[]): MediaSlot[] {
  const slots: MediaSlot[] = [];
  if (media360.length > 0) slots.push({ type: "360", frames: media360 });
  media.forEach((url) => slots.push({ type: "image", url }));
  return slots;
}

interface MobileProductLayoutProps {
  productName: string;
  productDescription: string;
  productDetails: string;
  collectionName: string;
  media360: string[];
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
  media360,
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
  const slots = useMemo(() => buildSlots(media360, media), [media360, media]);
  const current = slots[selectedImage];
  const is360 = current?.type === "360";
  const showUrl = current?.type === "image" ? current.url : null;
  const showIsVideo = showUrl ? getMediaType(showUrl) === "video" : false;

  return (
    <div className="md:hidden min-h-screen bg-[#f1f1f1]">
      {/* Full Screen Image Section (70% height) */}
      <div className="h-[70vh] w-full relative bg-[#f1f1f1] flex items-center justify-center p-6">
        {is360 && current.type === "360" ? (
          <motion.div
            key="360"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="w-full h-full"
          >
            <ThreeSixtyViewer images={current.frames} productName={productName} />
          </motion.div>
        ) : showUrl ? (
          showIsVideo ? (
            <motion.video
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={showUrl}
              className="w-full h-full object-cover"
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
              src={showUrl}
              alt={productName}
              className="w-full h-full object-cover"
            />
          )
        ) : null}

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </motion.div>

        {/* Collection Name */}
        {collectionName && (
          <motion.p
            className="text-sm text-neutral-500 mb-2 lowercase font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
          >
            {collectionName}
          </motion.p>
        )}

        {/* Product Name */}
        <motion.h1
          className="text-2xl font-bold text-black mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
        >
          {productName}
        </motion.h1>

        {/* Thumbnail Gallery - same slots as desktop (360 + media) */}
        <motion.div
          className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: "easeOut" }}
        >
          {slots.map((slot, index) => {
            const thumbSrc = slot.type === "360" ? slot.frames[0] : slot.url;
            const isVideo = slot.type === "image" && getMediaType(slot.url) === "video";
            const selected = selectedImage === index;
            return (
              <button
                key={`mobile-thumb-${index}`}
                type="button"
                onClick={() => onImageSelect(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all bg-[#f9f9f9] ${
                  selected ? "border-black ring-2 ring-black/10" : "border-transparent"
                }`}
              >
                {slot.type === "360" ? (
                  <>
                    {thumbSrc ? (
                      <img src={thumbSrc} alt="360°" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#f9f9f9] text-slate-500 text-xs font-medium" />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-white drop-shadow-sm">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                      </svg>
                    </span>
                  </>
                ) : isVideo ? (
                  <video src={thumbSrc} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                ) : (
                  <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Action Buttons Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: "easeOut" }}
        >
          <ProductActions
            onBack={() => {}}
            onOrder={onOrder}
            language={language}
            variant="mobile"
          />
        </motion.div>

        {/* Info Section */}
        <motion.div
          className="space-y-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22, ease: "easeOut" }}
        >
          <h2 className="text-lg font-bold text-black border-none">
            {language === "pt"
              ? "Informação do Produto"
              : "Product Information"}
          </h2>
          <p className="text-neutral-600 leading-relaxed text-sm">
            {productDescription}
          </p>
        </motion.div>

        {/* Details Section */}
        {productDetails && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.26, ease: "easeOut" }}
          >
            <h2 className="text-lg font-bold text-black border-none">
              {language === "pt" ? "Detalhes do Produto" : "Product Details"}
            </h2>
            <div
              className="text-neutral-600 text-sm leading-relaxed prose prose-neutral prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: productDetails }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};
