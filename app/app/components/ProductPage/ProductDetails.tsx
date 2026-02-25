import { motion } from "framer-motion";
import { useLanguage } from "~/contexts";

interface ProductDetailsProps {
  productDetails: string;
  language?: string;
  opacity: any; // MotionValue from framer-motion
}

export const ProductDetails = ({
  productDetails,
  opacity,
}: ProductDetailsProps) => {
  const { t } = useLanguage();
  if (!productDetails) return null;

  return (
    <motion.div
      style={{
        opacity,
        pointerEvents: opacity.get() === 0 ? "none" : "auto",
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        width: "100%",
      }}
      className="space-y-4"
    >
      <motion.h2
        className="text-3xl lg:text-4xl font-bold text-black border-b border-black/10 pb-4 font-display"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {t.product.productDetails}
      </motion.h2>
      <motion.div
        className="text-neutral-700 text-lg leading-relaxed pt-2 prose prose-neutral max-w-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
        dangerouslySetInnerHTML={{ __html: productDetails }}
      />
    </motion.div>
  );
};
