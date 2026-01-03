import { useEffect, useState, type MouseEventHandler } from "react";
import { useLoaderData } from "react-router";
import type { RecordModel } from "pocketbase";
import { motion } from "framer-motion";

import { createPocketBase } from "~/lib/pocketbase";
import { useLanguage } from "~/contexts";
import type { Route } from "../+types/root";
import type { CategoryRecord, ProductRecord } from "~/hooks";
import { FadeEntry } from "~/components/FadeEntry/FadeEntry";
import Filters from "~/components/Filters/Filters";

export async function loader({ request, params }: Route.LoaderArgs): Promise<{
  products: ProductRecord[];
  categories: CategoryRecord[];
  collection: RecordModel;
}> {
  const pb = createPocketBase(request);
  const collection = await pb
    .collection("collection")
    .getFirstListItem(`slug="${params.collection}"`);

  const baseUrl = pb.baseUrl.replace(/\/$/, "");
  collection.image = `${baseUrl}/api/files/collection/${collection.id}/${collection.image}`;

  const products: ProductRecord[] = await pb
    .collection("products")
    .getFullList({
      filter: `collection ?~ "${collection.id}" && enabled=true`,
      expand: "category,sizes",
    });

  const categoriesMap = new Map<string, CategoryRecord>();

  products.forEach((product) => {
    const cat = product.expand?.category;
    if (Array.isArray(cat)) {
      cat.forEach((c) => {
        if (c && c.id) {
          categoriesMap.set(c.id, c);
        }
      });
    } else if (cat && cat.id) {
      categoriesMap.set(cat.id, cat);
    }
  });

  const categoriesArray = Array.from(categoriesMap.values());
  return { products, categories: categoriesArray, collection };
}

export const CollectionPage = ({ request, params }: Route.ActionArgs) => {
  const loaderData = useLoaderData() || {};
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("todos-0");
  const [showFilter, setShowFilter] = useState(false);
  const { products = [], categories = [], collection = {} } = loaderData;
  const title = collection?.[`name_${language}`];

  useEffect(() => {
    const onScroll = () => {
      if (showFilter !== window.scrollY > 550) {
        setShowFilter(window.scrollY > 550);
      }
    };
    window.addEventListener("scroll", onScroll);
    // Call once on mount in case already scrolled
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  });

  console.log("products..", products);
  console.log("collection..", collection);

  const filters: {
    id: string;
    text: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
  }[] = categories.map((category: CategoryRecord) => ({
    id: category.id,
    text: category[`name_${language}`],
    onClick: () => setActiveCategory(category.id),
  }));
  filters.unshift({
    id: "todos-0",
    text: "Todos",
    onClick: () => setActiveCategory("todos-0"),
  });

  return (
    <section className="bg-[#f1f1f1]">
      <FadeEntry image={collection.image} title={title} />
      {showFilter && (
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="fixed top-20 left-1/2 w-auto  bg-black/40 transform -translate-x-1/2 py-4 px-8 rounded-xl z-10 backdrop-blur-sm"
        >
          <Filters
            items={filters}
            activeFilter={activeCategory}
            className="text-white"
            itemClassName="md:text-sm"
          />
        </motion.div>
      )}

      <article className="relative -mt-20 mb-20">
        <Filters
          items={filters}
          activeFilter={activeCategory}
          itemClassName="text-white text-md md:text-xl"
          delay={1.8}
        />
      </article>
    </section>
  );
};

export default CollectionPage;
