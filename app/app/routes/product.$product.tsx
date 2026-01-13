import { useState, useRef } from "react";
import { useLoaderData, useNavigate, Link } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "~/contexts";
import type { ProductRecord, SizeRecord } from "~/hooks/useProducts";
import { createPocketBase } from "~/lib/pocketbase";
import { createProductService } from "~/lib/services";
import { Button } from "~/components/Elements/Button/Button";
import {
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  ArrowUpLeft,
} from "lucide-react";
import { ProductCarousel } from "~/components/ProductCarousel";

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
    const lrelatedProducts = await productService.getByCollection(
      collectionList[0].id,
      {
        expand: "sizes,collection,category",
      }
    );
    // Filter out current product and limit to 6
    relatedProducts = lrelatedProducts
      .filter((p) => p.id !== product.id)
      .slice(0, 6);
  }

  return { product, relatedProducts };
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
        className="bg-[#f1f1f1] min-h-[200vh] relative z-0 overflow-x-hidden w-screen"
      >
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <motion.div
            style={{ y: translateY }}
            className="h-screen flex w-full relative"
          >
            {/* Left Column - Full Screen Image with Thumbnails */}
            <div className="w-1/2 relative h-full">
              {/* Main Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-white"
              >
                {media[selectedImage] && (
                  <img
                    src={media[selectedImage]}
                    alt={productName}
                    className="w-full h-full object-contain p-8"
                  />
                )}
              </motion.div>

              {/* Thumbnail Gallery - Overlaid at Bottom */}
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-10 transition-all">
                {media.map((img: string, index: number) => (
                  <motion.button
                    key={`thumb-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all bg-white ${
                      selectedImage === index
                        ? "border-black scale-110"
                        : "border-transparent hover:border-black/20"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${productName} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Right Column - Product Info & Details Centered Vertically */}
            <div className="w-1/2 h-full flex flex-col justify-center px-12 lg:px-20 relative">
              <div className="relative w-full">
                {/* Product Info - Fades Out */}
                <motion.div
                  style={{ opacity: infoOpacity }}
                  className="space-y-6"
                >
                  {/* Breadcrumbs */}
                  <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-5">
                    {breadcrumbs.map((crumb, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {crumb.to ? (
                          <Link
                            to={crumb.to}
                            className="hover:text-black transition-colors"
                          >
                            {crumb.label}
                          </Link>
                        ) : (
                          <span
                            className={
                              crumb.active
                                ? "text-neutral-900 font-medium truncate max-w-[150px]"
                                : ""
                            }
                          >
                            {crumb.label}
                          </span>
                        )}
                        {idx < breadcrumbs.length - 1 && (
                          <ChevronRight
                            size={10}
                            className="text-neutral-300"
                          />
                        )}
                      </div>
                    ))}
                  </nav>

                  {/* Collection */}
                  {collectionName && (
                    <p className="text-sm text-neutral-600 uppercase tracking-wide">
                      {collectionName}
                    </p>
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

                  {/* Size Selector - Dropdown */}
                  {sortedSizes.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-600">
                        {language === "pt"
                          ? "Selecionar Tamanho"
                          : "Select Size"}
                      </label>
                      <div className="relative w-full max-w-xs">
                        <select
                          value={selectedSize || ""}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="w-full h-11 px-4 bg-white border border-neutral-200 rounded-md text-sm font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-black transition-all cursor-pointer"
                        >
                          <option value="" disabled>
                            {language === "pt"
                              ? "Escolha um tamanho"
                              : "Choose a size"}
                          </option>
                          {sortedSizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                          <ChevronDown size={18} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="flex-none rounded-xl py-6"
                      leftIcon={<ArrowUpLeft size={16} />}
                    >
                      {language === "pt" ? "Voltar" : "Back"}
                    </Button>

                    <Button
                      variant="primary"
                      onClick={handleOrder}
                      className="flex-1 rounded-xl py-6"
                      rightIcon={<ShoppingBag size={18} />}
                    >
                      {language === "pt" ? "ENCOMENDAR AGORA" : "ORDER NOW"}
                    </Button>
                  </div>
                </motion.div>

                {/* Product Details - Fades In */}
                {productDetails && (
                  <motion.div
                    style={{
                      opacity: detailsOpacity,
                      pointerEvents:
                        detailsOpacity.get() === 0 ? "none" : "auto",
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "100%",
                    }}
                    className="space-y-4"
                  >
                    <h2 className="text-3xl lg:text-4xl font-bold text-black border-b border-black/10 pb-4">
                      {language === "pt"
                        ? "Detalhes do Produto"
                        : "Product Details"}
                    </h2>
                    <div
                      className="text-neutral-700 text-lg leading-relaxed pt-2 prose prose-neutral max-w-none"
                      dangerouslySetInnerHTML={{ __html: productDetails }}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden min-h-screen bg-[#f1f1f1]">
          {/* Full Screen Image Section (70% height) */}
          <div className="h-[70vh] w-full relative bg-[#f1f1f1] flex items-center justify-center p-6 ">
            {media[selectedImage] && (
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={media[selectedImage]}
                alt={productName}
                className="w-full h-full object-contain"
              />
            )}

            {/* Size Selector - Square Buttons Overlaid at Bottom */}
            {sortedSizes.length > 0 && (
              <div className="absolute bottom-16 left-0 w-full flex justify-center gap-2 px-6 flex-wrap">
                {sortedSizes.map((size) => (
                  <button
                    key={`size-square-${size}`}
                    onClick={() => setSelectedSize(size)}
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
            <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-5">
              {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      className="hover:text-black transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        crumb.active
                          ? "text-neutral-900 font-medium truncate max-w-[150px]"
                          : ""
                      }
                    >
                      {crumb.label}
                    </span>
                  )}
                  {idx < breadcrumbs.length - 1 && (
                    <ChevronRight size={10} className="text-neutral-300" />
                  )}
                </div>
              ))}
            </nav>

            {/* Collection Name */}
            {collectionName && (
              <p className="text-sm text-neutral-500 mb-2 lowercase font-light">
                {collectionName}
              </p>
            )}
            {/* Product Name */}
            <h1 className="text-2xl font-bold text-black mb-6">
              {productName}
            </h1>

            {/* Thumbnail Gallery */}
            <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
              {media.map((img, index) => (
                <button
                  key={`mobile-thumb-${index}`}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-sm overflow-hidden border-2 transition-all bg-[#f9f9f9] ${
                    selectedImage === index
                      ? "border-black"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>

            {/* Action Buttons Row */}
            <div className="flex gap-4 mb-10">
              <Button
                variant="primary"
                onClick={handleOrder}
                className="w-3/4 flex-[2] rounded-2xl h-14 border-none transition-colors"
                rightIcon={<ShoppingBag size={20} />}
              >
                {language === "pt" ? "ENCOMENDAR AGORA" : "ORDER NOW"}
              </Button>
            </div>

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
                  {language === "pt"
                    ? "Detalhes do Produto"
                    : "Product Details"}
                </h2>
                <div
                  className="text-neutral-600 text-sm leading-relaxed prose prose-neutral prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: productDetails }}
                />
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Product Carousel - Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="bg-[#f1f1f1] p-16">
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
            ctaLink={`/collection/${collectionList[0]?.slug}`}
          />
        </div>
      )}
    </>
  );
};

export default ProductPage;
