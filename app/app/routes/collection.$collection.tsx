import { useState, useEffect, useMemo } from "react";
import { useLoaderData, redirect } from "react-router";
import { motion } from "framer-motion";

import { useLanguage } from "~/contexts";
import type { TranslatedProduct } from "~/lib/services/product.service";
import type { TranslatedCategory } from "~/lib/services/category.service";
import { FadeEntry } from "~/components/FadeEntry/FadeEntry";
import Filters from "~/components/Filters/Filters";
import ProductCard from "~/components/Cards/ProductCard";
import CategoryCard from "~/components/Cards/CategoryCard";
import CategoriesList from "~/components/CategoriesList";
import { useScrollSpy } from "~/hooks/useScrollSpy";
import { getCategoryFilters } from "~/utils/filters";
import { mapCategoriesWithProducts } from "~/utils/categories";
import { createPocketBase, canAccessUserBackoffice, getUserBlockedStatus, getUserAllowedProductIds } from "~/lib/pocketbase";
import {
  createCollectionService,
  createProductService,
  createCategoryService,
} from "~/lib/services";
import { SmallCTA } from "~/components/SmallCTA";
import { getLanguageFromRequest } from "~/lib/utils";

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { collection?: string };
}) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) {
    return redirect("/auth/login");
  }
  const user = pb.authStore.model as { id?: string; admin?: boolean } | null;
  if (user?.id && (await getUserBlockedStatus(pb, user))) return redirect("/blocked");
  if (user?.id && !(await canAccessUserBackoffice(pb, user))) return redirect("/pending-approval");

  const language = getLanguageFromRequest(request);
  const allowedIds = await getUserAllowedProductIds(pb, user);

  const collectionService = createCollectionService(pb, language);
  const productService = createProductService(pb, language);
  const categoryService = createCategoryService(pb, language);

  // Get collection by slug
  const collection = await collectionService.getBySlug(params.collection || "");
  if (!collection) {
    throw new Response("Collection not found", { status: 404 });
  }

  // Get products for this collection
  let products = await productService.getByCollection(collection.id, {
    expand: "category,sizes",
  });
  if (allowedIds?.length) products = products.filter((p: any) => allowedIds.includes(p.id));

  // Extract categories from products
  const categories = categoryService.getCategoriesFromProducts(products);

  return { products, categories, collection, language };
}

export const CollectionPage = () => {
  const loaderData = useLoaderData<typeof loader>();
  const [showFilter, setShowFilter] = useState(false);
  const [activeCategory, setActiveCategory] = useState("todos-0");

  // Safely extract loader data with defaults
  const loaderDataSafe = loaderData || {};
  const {
    products = [],
    categories = [],
    collection,
    language: loaderLanguage,
  } = loaderDataSafe;
  const { language: contextLanguage, t } = useLanguage();
  const language = loaderLanguage || contextLanguage;

  const title = collection?.name;

  // Show only the first 6 products and 2 categories as featured
  const featuredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.slice(0, 6);
  }, [products]);

  const featuredCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.slice(0, 2);
  }, [categories]);

  // Map categories to their products
  const categoriesWithProductsArray = useMemo(() => {
    if (!Array.isArray(categories) || !Array.isArray(products)) return [];
    return mapCategoriesWithProducts(categories, products);
  }, [categories, products]);

  // Get filters - use useCallback to stabilize setActiveCategory
  const filters = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return getCategoryFilters({
      categories,
      allLabel: t?.common?.all ?? "All",
      setActiveCategory,
    });
  }, [categories, t]);

  // Scrollspy - only if we have categories
  useScrollSpy({
    categories: Array.isArray(categories) ? categories : [],
    setActiveCategory,
    offset: 200,
  });

  // Sticky filter toggle on scroll
  useEffect(() => {
    const onScroll = () => {
      try {
        setShowFilter(window.scrollY > 550);
      } catch (error) {
        // Silently handle errors during navigation
      }
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!collection) return null;

  return (
    <section className="bg-[#f1f1f1]">
      <FadeEntry image={collection.image} title={title} />
      {showFilter && (
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="fixed top-22 md:top-28 left-1/2 w-auto bg-black/40 transform -translate-x-1/2 py-2 px-4 md:py-4 md:px-8 rounded-xl z-10 backdrop-blur-sm"
        >
          <Filters
            items={filters}
            activeFilter={activeCategory}
            className="text-white"
            itemClassName="text-xs md:text-sm"
          />
        </motion.div>
      )}
      <article className="relative -mt-40 mb-10">
        <Filters
          items={filters}
          activeFilter={activeCategory}
          itemClassName="text-white text-md md:text-xl"
          delay={1.8}
        />
        <div className="mx-auto max-w-7xl">
          <div className="products flex justify-center gap-4 pt-16 items-center flex-wrap md:flex-nowrap">
            {featuredProducts.map(
              (product: TranslatedProduct, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.2 + index / 8, duration: 1.2 }}
                  className="md:w-1/6 w-[calc(50%-20px)]"
                >
                  <ProductCard
                    name={product.name}
                    media={{
                      image: product.media?.[0] ?? "",
                      hover: product.media_hover ?? "",
                    }}
                    link={`/product/${product.slug}`}
                  />
                </motion.div>
              )
            )}
          </div>
          <div className="categories flex justify-between gap-4 pt-4 items-center flex-wrap md:flex-nowrap">
            {featuredCategories.map(
              (category: TranslatedCategory, index: number) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.2, once: true }}
                  transition={{ delay: 0.5 + index / 8, duration: 1.2 }}
                  className={`w-full px-3 md:p-0 ${index === 1 ? "md:w-3/5" : "md:w-2/5 hidden md:block"}`}
                >
                  <CategoryCard
                    name={category.name}
                    description={category.description}
                    media={{
                      image: category.media,
                      hover: category.hover,
                    }}
                    link={`/category/${category.slug}`}
                  />
                </motion.div>
              )
            )}
          </div>
          <CategoriesList
            categories={categoriesWithProductsArray}
            language={language}
          />
        </div>
      </article>
      <div className="mx-auto max-w-7xl">
        <SmallCTA />
      </div>
    </section>
  );
};

export default CollectionPage;
