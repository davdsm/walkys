import { motion } from "framer-motion";

interface ProductDetailsProps {
  productDetails: string;
  language: string;
  opacity: any; // MotionValue from framer-motion
}

export const ProductDetails = ({
  productDetails,
  language,
  opacity,
}: ProductDetailsProps) => {
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
      <h2 className="text-3xl lg:text-4xl font-bold text-black border-b border-black/10 pb-4">
        {language === "pt" ? "Detalhes do Produto" : "Product Details"}
      </h2>
      <div
        className="text-neutral-700 text-lg leading-relaxed pt-2 prose prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: productDetails }}
      />
    </motion.div>
  );
};
