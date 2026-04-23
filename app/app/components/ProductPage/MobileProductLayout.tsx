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
      <div className="h-[70vh] w-full relative bg-[#f1f1f1] flex items-center justify-center">
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
              src={showUrl}
              alt={productName}
              className="w-full h-full object-contain"
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

      </div>
    </div>
  );
};
