import { useState, useRef } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "~/contexts";
import type { ProductRecord, SizeRecord } from "~/hooks/useProducts";
import { createPocketBase } from "~/lib/pocketbase";
import { createProductService } from "~/lib/services";
import {
  ProductImageGallery,
  ProductInfo,
  ProductDetails,
  MobileProductLayout,
  RelatedProducts,
} from "~/components/ProductPage";

interface ProductLoaderData {
  product: ProductRecord;
  relatedProducts: ProductRecord[];
}

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { product?: string };
}): Promise<ProductLoaderData> {
  const pb = createPocketBase(request);
  const productService = createProductService(pb);

  const product = await productService.getBySlug(params.product || "", {
    expand: "sizes,collection,category",
  });

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  // Get related products from the same collection
  const expand = (product as any)?.expand || {};
  const collectionList = expand.collection
    ? Array.isArray(expand.collection)
      ? expand.collection
      : [expand.collection]
    : [];

  let relatedProducts: ProductRecord[] = [];
  if (collectionList.length > 0 && collectionList[0]?.id) {
    const lrelatedProducts = (await productService.getByCollection(
      collectionList[0].id,
      {
        expand: "sizes,collection,category",
      }
    )) as ProductRecord[];
    // Filter out current product and limit to 6
    relatedProducts = lrelatedProducts
      .filter((p) => p.id !== product.id)
      .slice(0, 6);
  }

  // Ensure that 'product' always satisfies 'ProductRecord' requirements
  // If 'expand' is missing, add an empty object to satisfy the typing
  if (!(product as any).expand) {
    (product as any).expand = {};
  }

  // Ensure the returned 'product' conforms exactly to 'ProductRecord' type
  return { product: product as ProductRecord, relatedProducts };
}

export const ProductPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const loaderData = useLoaderData() || {};
  const { product, relatedProducts } = loaderData as ProductLoaderData;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const langKey = language === "pt" ? "pt" : "en";

  // Extract product data
  const productName = (product as any)?.[`name_${langKey}`] ?? "";
  const productDescription = (product as any)?.[`description_${langKey}`] ?? "";
  const productDetails = (product as any)?.[`details_${langKey}`] ?? "";
  const media = product?.media || [];
  const expand = (product as any)?.expand || {};

  // Get collection name
  const collectionList = expand.collection
    ? Array.isArray(expand.collection)
      ? expand.collection
      : [expand.collection]
    : [];
  const collectionName =
    collectionList.length > 0
      ? collectionList[0]?.[`name_${langKey}`] || ""
      : "";

  // Get category name
  const categoryList = expand.category
    ? Array.isArray(expand.category)
      ? expand.category
      : [expand.category]
    : [];
  const categoryName =
    categoryList.length > 0 ? categoryList[0]?.[`name_${langKey}`] || "" : "";
  const categorySlug =
    categoryList.length > 0 ? categoryList[0]?.slug || "" : "";

  // Breadcrumbs data
  const breadcrumbs = [
    { label: language === "pt" ? "Início" : "Home", to: "/" },
    {
      label: categoryName,
      to: categorySlug ? `/category/${categorySlug}` : null,
    },
    { label: productName, to: null, active: true },
  ].filter((b) => b.label);

  // Get sizes
  const sizes: SizeRecord[] = expand.sizes || [];
  const sortedSizes = sizes
    .map((s) => s.number)
    .sort((a, b) => Number.parseFloat(a) - Number.parseFloat(b));

  // Scroll animation for right column
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Fade out product info, fade in details
  const infoOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [1, 0.5, 0]);
  const detailsOpacity = useTransform(
    scrollYProgress,
    [0.3, 0.5, 0.7],
    [0, 0.5, 1]
  );

  const handleBack = () => {
    navigate(-1);
  };

  const handleOrder = () => {
    // TODO: Implement order functionality
    console.log("Order product:", product?.id, "Size:", selectedSize);
  };

  // Calculate the amount to translate to "stick" the desktop layout
  const translateY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <>
      <section
        ref={containerRef}
        className="bg-[#f1f1f1] md:min-h-[200vh] relative z-0 overflow-x-hidden w-screen"
      >
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <motion.div
            style={{ y: translateY }}
            className="h-screen flex w-full relative"
          >
            {/* Left Column - Full Screen Image with Thumbnails */}
            <ProductImageGallery
              media={media}
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
              productName={productName}
            />

            {/* Right Column - Product Info & Details Centered Vertically */}
            <div className="w-1/2 h-full flex flex-col justify-center px-12 lg:px-20 relative">
              <div className="relative w-full">
                {/* Product Info - Fades Out */}
                <ProductInfo
                  productName={productName}
                  productDescription={productDescription}
                  collectionName={collectionName}
                  collectionSlug={collectionList[0]?.slug || null}
                  breadcrumbs={breadcrumbs}
                  sizes={sortedSizes}
                  selectedSize={selectedSize}
                  onSizeSelect={setSelectedSize}
                  onBack={handleBack}
                  onOrder={handleOrder}
                  language={language}
                  opacity={infoOpacity}
                />

                {/* Product Details - Fades In */}
                <ProductDetails
                  productDetails={productDetails}
                  language={language}
                  opacity={detailsOpacity}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Layout */}
        <MobileProductLayout
          productName={productName}
          productDescription={productDescription}
          productDetails={productDetails}
          collectionName={collectionName}
          media={media}
          selectedImage={selectedImage}
          onImageSelect={setSelectedImage}
          sizes={sortedSizes}
          selectedSize={selectedSize}
          onSizeSelect={setSelectedSize}
          onOrder={handleOrder}
          breadcrumbs={breadcrumbs}
          language={language}
        />
      </section>

      {/* Related Products */}
      <RelatedProducts
        relatedProducts={relatedProducts}
        collectionSlug={collectionList[0]?.slug || null}
        language={language}
        langKey={langKey}
      />
    </>
  );
};

export default ProductPage;
