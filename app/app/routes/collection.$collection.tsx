import { useState, useEffect, useMemo } from "react";
import { useLoaderData, redirect } from "react-router";
import { motion } from "framer-motion";

import type { Route } from "./+types/collection.$collection";
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
import { createPocketBase, getUserAccessSnapshot } from "~/lib/pocketbase";
import {
  createCollectionService,
  createProductService,
  createCategoryService,
} from "~/lib/services";
import { SmallCTA } from "~/components/SmallCTA";
import { getLanguageFromRequest } from "~/lib/utils";
import { buildSeoMeta } from "~/lib/seo";
import { resolveProductCardMedia } from "~/lib/product-media";

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
  const access = await getUserAccessSnapshot(pb, user);
  if (access.blocked) return redirect("/blocked");
  if (!access.canAccessBackoffice) return redirect("/pending-approval");

  const language = getLanguageFromRequest(request);
  const allowedIds = access.allowedProductIds;

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
    expand: "category",
    fields:
      "id,slug,name_en,name_pt,description_en,description_pt,media,media_hover,enabled,category,expand.category.id,expand.category.slug,expand.category.name_en,expand.category.name_pt,expand.category.description_en,expand.category.description_pt,expand.category.media,expand.category.hover",
  });
  if (allowedIds?.length) products = products.filter((p: any) => allowedIds.includes(p.id));

  // Extract categories from products
  const categories = categoryService.getCategoriesFromProducts(products);

  return { products, categories, collection, language };
}

export function meta({ data, params }: Route.MetaArgs) {
  const collectionName = data?.collection?.name || params.collection || "Collection";
  const description = data?.products?.length
    ? `Explore ${data.products.length} styles from the ${collectionName} collection by Walkys.`
    : `Explore the ${collectionName} collection by Walkys.`;

  return buildSeoMeta({
    title: collectionName,
    description,
    pathname: params.collection ? `/collection/${params.collection}` : "/collection",
    image: data?.collection?.image,
  });
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

  // Hide global header while sticky filters are visible.
  useEffect(() => {
    const header = document.getElementById("main-header");
    if (!header) return;

    header.style.transition = "opacity 220ms ease, transform 220ms ease";
    header.style.willChange = "opacity, transform";
    header.style.opacity = showFilter ? "0" : "1";
    header.style.transform = showFilter ? "translateY(-16px)" : "translateY(0)";
    header.style.pointerEvents = showFilter ? "none" : "";

    return () => {
      header.style.transition = "";
      header.style.willChange = "";
      header.style.opacity = "";
      header.style.transform = "";
      header.style.pointerEvents = "";
    };
  }, [showFilter]);

  if (!collection) return null;

  return (
    <section className="bg-[#f1f1f1]">
      <FadeEntry image={collection.image} title={title} />
      {showFilter && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-4 md:top-6 left-1/2 w-[calc(100%-1rem)] md:w-[min(92vw,1200px)] bg-black/40 transform -translate-x-1/2 py-2 px-3 md:py-4 md:px-8 rounded-xl z-10 backdrop-blur-sm"
        >
          <Filters
            items={filters}
            activeFilter={activeCategory}
            className="text-white"
            itemClassName="text-xs md:text-sm"
          />
        </motion.div>
      )}
      <article className="relative -mt-24 sm:-mt-32 md:-mt-40 mb-10 px-0">
        <Filters
          items={filters}
          activeFilter={activeCategory}
          itemClassName="text-white text-md md:text-xl"
          delay={0.15}
        />
        <div className="mx-auto max-w-7xl">
          <div className="products flex justify-center gap-4 pt-16 items-center flex-wrap md:flex-nowrap">
            {featuredProducts.map(
              (product: TranslatedProduct, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.04, duration: 0.45 }}
                  className="md:w-1/6 w-[calc(50%-20px)]"
                >
                  <ProductCard
                    name={product.name}
                    media={resolveProductCardMedia(product)}
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
                    //description={category.description}
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
