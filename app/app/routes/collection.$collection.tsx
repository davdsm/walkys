import { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import { motion } from "framer-motion";

import { useLanguage } from "~/contexts";
import type { ProductRecord } from "~/hooks/useProducts";
import type { CategoryRecord } from "~/hooks/useCategories";
import { FadeEntry } from "~/components/FadeEntry/FadeEntry";
import Filters from "~/components/Filters/Filters";
import ProductCard from "~/components/Cards/ProductCard";
import CategoryCard from "~/components/Cards/CategoryCard";
import CategoriesList from "~/components/CategoriesList";
import { useScrollSpy } from "~/hooks/useScrollSpy";
import { getCategoryFilters } from "~/utils/filters";
import { mapCategoriesWithProducts } from "~/utils/categories";
import { createPocketBase } from "~/lib/pocketbase";
import {
  createCollectionService,
  createProductService,
  createCategoryService,
  type CollectionRecord,
} from "~/lib/services";
import { SmallCTA } from "~/components/SmallCTA";

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { collection?: string };
}): Promise<{
  products: ProductRecord[];
  categories: CategoryRecord[];
  collection: CollectionRecord;
}> {
  const pb = createPocketBase(request);
  const collectionService = createCollectionService(pb);
  const productService = createProductService(pb);
  const categoryService = createCategoryService(pb);

  // Get collection by slug
  const collection = await collectionService.getBySlug(params.collection || "");
  if (!collection) {
    throw new Response("Collection not found", { status: 404 });
  }

  // Get products for this collection
  const products = await productService.getByCollection(collection.id, {
    expand: "category,sizes",
  });

  // Extract categories from products
  const categories = categoryService.getCategoriesFromProducts(products);

  return { products, categories, collection };
}

export const CollectionPage = () => {
  const loaderData = useLoaderData() || {};
  const [showFilter, setShowFilter] = useState(false);
  const [activeCategory, setActiveCategory] = useState("todos-0");
  const { language } = useLanguage();
  const { products = [], categories = [], collection = {} } = loaderData;
  const title = collection?.[`name_${language}`];

  // Show only the first 6 products and 2 categories as featured
  const featuredProducts = products.slice(0, 6);
  const featuredCategories = categories.slice(0, 2);

  // Map categories to their products
  const categoriesWithProductsArray = mapCategoriesWithProducts(
    categories,
    products
  );
  // Get filters
  const filters = getCategoryFilters({
    categories,
    language,
    setActiveCategory,
  });
  // Scrollspy
  useScrollSpy({ categories, setActiveCategory, offset: 200 });

  // Sticky filter toggle on scroll
  useEffect(() => {
    const onScroll = () => setShowFilter(window.scrollY > 550);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <article className="relative -mt-40 mb-40">
        <Filters
          items={filters}
          activeFilter={activeCategory}
          itemClassName="text-white text-md md:text-xl"
          delay={1.8}
        />
        <div className="mx-auto max-w-7xl">
          <div className="products flex justify-center gap-4 pt-16 items-center flex-wrap md:flex-nowrap">
            {featuredProducts.map((product: ProductRecord, index: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 + index / 8, duration: 1.2 }}
              >
                <ProductCard
                  name={product[`name_${language}`] ?? ""}
                  media={{
                    image: product.media?.[0] ?? "",
                    hover: product.media_hover ?? "",
                  }}
                  link={`/product/${product.slug}`}
                />
              </motion.div>
            ))}
          </div>
          <div className="categories flex justify-between gap-4 pt-4 items-center flex-wrap md:flex-nowrap">
            {featuredCategories.map(
              (category: CategoryRecord, index: number) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.2, once: true }}
                  transition={{ delay: 0.5 + index / 8, duration: 1.2 }}
                  className={`w-full px-3 md:p-0 ${index === 1 ? "md:w-3/5" : "md:w-2/5 hidden md:block"}`}
                >
                  <CategoryCard
                    name={category[`name_${language}`] ?? ""}
                    description={category[`description_${language}`] ?? ""}
                    media={{
                      image: category.media ?? "",
                      hover: category.hover ?? "",
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
      <SmallCTA />
    </section>
  );
};

export default CollectionPage;
