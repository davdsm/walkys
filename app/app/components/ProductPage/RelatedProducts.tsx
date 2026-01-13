import { ProductCarousel } from "~/components/ProductCarousel";
import type { ProductRecord } from "~/hooks/useProducts";

interface RelatedProductsProps {
  relatedProducts: ProductRecord[];
  collectionSlug: string | null;
  language: string;
  langKey: string;
}

export const RelatedProducts = ({
  relatedProducts,
  collectionSlug,
  language,
  langKey,
}: RelatedProductsProps) => {
  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className="bg-[#f1f1f1] md:p-16 p-8 overflow-x-hidden">
      <ProductCarousel
        title={
          language === "pt"
            ? "Produtos Recomendados"
            : "More products from this collection"
        }
        subtitle={
          language === "pt"
            ? "Mais produtos desta coleção"
            : "More products from this collection"
        }
        cards={relatedProducts.map((p) => ({
          id: p.id,
          name: (p as any)[`name_${langKey}`] || "",
          media: {
            image: p.media?.[0] || "",
            hover: p.media_hover || p.media?.[1] || p.media?.[0] || "",
          },
          link: `/product/${p.slug}`,
        }))}
        ctaText={language === "pt" ? "VER COLEÇÃO" : "VIEW COLLECTION"}
        ctaLink={collectionSlug ? `/collection/${collectionSlug}` : "#"}
      />
    </div>
  );
};
