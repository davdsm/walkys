import { ProductCarousel } from "~/components/ProductCarousel";
import { useLanguage } from "~/contexts";
import type { ProductRecord } from "~/hooks/useProducts";
import { resolveProductCardMedia } from "~/lib/product-media";

interface RelatedProductsProps {
  relatedProducts: ProductRecord[];
  collectionSlug: string | null;
  language: string;
  langKey: string;
}

export const RelatedProducts = ({
  relatedProducts,
  collectionSlug,
  langKey,
}: RelatedProductsProps) => {
  const { t } = useLanguage();
  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className="bg-[#f1f1f1] md:p-16 p-8 overflow-x-hidden">
      <ProductCarousel
        title={t.product.relatedProductsTitle}
        subtitle={t.product.relatedProductsSubtitle}
        cards={relatedProducts.map((p) => ({
          id: p.id,
          name: (p as any)[`name_${langKey}`] || "",
          media: resolveProductCardMedia(p),
          link: `/product/${p.slug}`,
        }))}
        ctaText={t.product.viewCollection}
        ctaLink={collectionSlug ? `/collection/${collectionSlug}` : "#"}
      />
    </div>
  );
};
