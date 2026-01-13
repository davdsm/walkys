import { motion } from "framer-motion";
import { Link } from "react-router";
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
  return (
    <motion.div style={{ opacity }} className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      {/* Collection */}
      {collectionName && collectionSlug && (
        <Link to={`/collection/${collectionSlug}`}>
          <p className="text-sm text-neutral-600 uppercase tracking-wide pb-8">
            {collectionName}
          </p>
        </Link>
      )}

      {/* Product Name */}
      <h1 className="text-4xl lg:text-5xl font-bold text-black">
        {productName}
      </h1>

      {/* Description */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-black">
          {language === "pt"
            ? "Informação do Produto"
            : "Product Information"}
        </h2>
        <p className="text-neutral-700 leading-relaxed text-lg">
          {productDescription}
        </p>
      </div>

      {/* Size Selector */}
      <SizeSelector
        sizes={sizes}
        selectedSize={selectedSize}
        onSizeSelect={onSizeSelect}
        language={language}
      />

      {/* Action Buttons */}
      <ProductActions
        onBack={onBack}
        onOrder={onOrder}
        language={language}
        variant="desktop"
      />
    </motion.div>
  );
};
