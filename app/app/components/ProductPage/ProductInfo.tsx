import { motion } from "framer-motion";
import { Link } from "react-router";
import { useLanguage } from "~/contexts";
import { Breadcrumbs } from "./Breadcrumbs";
import { SizeSelector } from "./SizeSelector";
import { ProductActions } from "./ProductActions";

interface ProductInfoProps {
  productName: string;
  productDescription: string;
  collectionName: string;
  collectionSlug: string | null;
  breadcrumbs: Array<{ label: string; to: string | null; active?: boolean }>;
  sizes: string[];
  selectedSize: string | null;
  onSizeSelect: (size: string) => void;
  onBack: () => void;
  onOrder: () => void;
  language: string;
  opacity: any; // MotionValue from framer-motion
}

export const ProductInfo = ({
  productName,
  productDescription,
  collectionName,
  collectionSlug,
  breadcrumbs,
  sizes,
  selectedSize,
  onSizeSelect,
  onBack,
  onOrder,
  language,
  opacity,
}: ProductInfoProps) => {
  const { t } = useLanguage();
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: "easeOut" as const },
  };
  return (
    <motion.div style={{ opacity }} className="space-y-6">
      {/* Breadcrumbs */}
      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0 }}>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </motion.div>

      {/* Collection */}
      {collectionName && collectionSlug && (
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }}>
          <Link to={`/collection/${collectionSlug}`}>
            <p className="text-sm text-neutral-600 uppercase tracking-wide pb-8">
              {collectionName}
            </p>
          </Link>
        </motion.div>
      )}

      {/* Product Name */}
      <motion.h1
        className="text-4xl lg:text-5xl font-bold text-black"
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
      >
        {productName}
      </motion.h1>

      {/* Description */}
      <motion.div
        className="space-y-2"
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.14 }}
      >
        <h2 className="text-lg font-semibold text-black">
          {t.product.productInformation}
        </h2>
        <p className="text-neutral-700 leading-relaxed text-lg">
          {productDescription}
        </p>
      </motion.div>

      {/* Size Selector */}
      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.18 }}>
        <SizeSelector
          sizes={sizes}
          selectedSize={selectedSize}
          onSizeSelect={onSizeSelect}
          language={language}
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.22 }}>
        <ProductActions
          onBack={onBack}
          onOrder={onOrder}
          language={language}
          variant="desktop"
        />
      </motion.div>
    </motion.div>
  );
};
