import { useState, useMemo } from "react";
import { useLoaderData, useNavigate, useRouteLoaderData, redirect } from "react-router";
import { motion } from "framer-motion";
import { useLanguage, useCart } from "~/contexts";
import type { ProductRecord, SizeRecord } from "~/hooks/useProducts";
import type { Route } from "./+types/product.$product";
import { createPocketBase, canAccessUserBackoffice, getUserBlockedStatus, getUserAllowedProductIds } from "~/lib/pocketbase";
import { createProductService } from "~/lib/services";
import {
  ProductMediaView,
  ProductInfo,
  MobileProductLayout,
  RelatedProducts,
} from "~/components/ProductPage";
import { buildSeoMeta } from "~/lib/seo";

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
  if (!pb.authStore.isValid) {
    return redirect("/auth/login");
  }
  const user = pb.authStore.model as { id?: string; admin?: boolean } | null;
  if (user?.id && (await getUserBlockedStatus(pb, user))) return redirect("/blocked");
  if (user?.id && !(await canAccessUserBackoffice(pb, user))) return redirect("/pending-approval");

  const allowedIds = await getUserAllowedProductIds(pb, user);
  const productService = createProductService(pb);

  const product = await productService.getBySlug(params.product || "", {
    expand: "sizes,collection,category",
  });

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  if (allowedIds?.length && !allowedIds.includes(product.id)) {
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
    let lrelatedProducts = (await productService.getByCollection(
      collectionList[0].id,
      {
        expand: "sizes,collection,category",
      },
    )) as ProductRecord[];
    if (allowedIds?.length) lrelatedProducts = lrelatedProducts.filter((p) => allowedIds.includes(p.id));
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

export function meta({ data, params }: Route.MetaArgs) {
  const product = data?.product as
    | (ProductRecord & {
        name_en?: string;
        name_pt?: string;
        description_en?: string;
        description_pt?: string;
      })
    | undefined;
  const productName = product?.name_en || product?.name_pt || params.product || "Product";
  const productDescription =
    product?.description_en || product?.description_pt || `Discover ${productName} from Walkys.`;

  return buildSeoMeta({
    title: productName,
    description: productDescription,
    pathname: params.product ? `/product/${params.product}` : "/product",
    image: Array.isArray(product?.media) ? product.media[0] : undefined,
  });
}

export const ProductPage = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const rootData = useRouteLoaderData("root") as { user?: unknown } | undefined;
  const isAuthenticated = !!rootData?.user;

  const loaderData = useLoaderData() || {};
  const { product, relatedProducts } = loaderData as ProductLoaderData;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const langKey = language === "pt" ? "pt" : "en";

  // Extract product data
  const productName = (product as any)?.[`name_${langKey}`] ?? "";
  const productDescription = (product as any)?.[`description_${langKey}`] ?? "";
  const mediaMain = Array.isArray(product?.media) ? product.media : [];
  const media360 = useMemo(
    () => (Array.isArray((product as any)?.media_360) ? (product as any).media_360 : []),
    [product]
  );
  const expand = (product as any)?.expand || {};
  const productSlug = (product as any)?.slug ?? "";
  const productId = (product as any)?.id ?? "";
  const firstMediaUrl =
    (Array.isArray(mediaMain) && mediaMain.length > 0 ? mediaMain[0] : undefined) ??
    (media360.length > 0 ? media360[0] : undefined);

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
    { label: t.common.home, to: "/" },
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

  const handleBack = () => {
    navigate(-1);
  };

  const handleOrder = () => {
    if (isAuthenticated) {
      addItem({
        productId,
        slug: productSlug,
        name: productName,
        size: selectedSize,
        imageUrl: typeof firstMediaUrl === "string" ? firstMediaUrl : undefined,
      });
      openCart();
    } else {
      navigate("/contact");
    }
  };

  return (
    <>
      <section className="bg-[#f1f1f1] md:min-h-screen relative z-0 overflow-x-hidden w-full max-w-full">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <motion.div
            className="h-screen flex w-full relative"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Left Column - Full Screen Image with Thumbnails */}
            <motion.div className="w-1/2 relative h-full">
              <ProductMediaView
                media360={media360}
                media={mediaMain}
                selectedIndex={selectedImage}
                onSelectIndex={setSelectedImage}
                productName={productName}
              />
            </motion.div>

            {/* Right Column - Product Info */}
            <motion.div
              className="w-1/2 h-full flex flex-col justify-center px-12 lg:px-20 relative"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            >
              <div className="relative w-full">
                {/* Product Info (no scroll-based fade) */}
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
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Layout */}
        <motion.div
          className="md:hidden"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <MobileProductLayout
            productName={productName}
            productDescription={productDescription}
            collectionName={collectionName}
            media360={media360}
            media={mediaMain}
            selectedImage={selectedImage}
            onImageSelect={setSelectedImage}
            sizes={sortedSizes}
            selectedSize={selectedSize}
            onSizeSelect={setSelectedSize}
            onOrder={handleOrder}
            breadcrumbs={breadcrumbs}
            language={language}
          />
        </motion.div>
      </section>

      {/* Related Products */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      >
        <RelatedProducts
          relatedProducts={relatedProducts}
          collectionSlug={collectionList[0]?.slug || null}
          language={language}
          langKey={langKey}
        />
      </motion.div>
    </>
  );
};

export default ProductPage;
