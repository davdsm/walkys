import { useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { motion } from "framer-motion";

import { useLanguage } from "~/contexts";
import type { ProductRecord } from "~/hooks/useProducts";
import type { CategoryRecord } from "~/hooks/useCategories";
import ProductCard from "~/components/Cards/ProductCard";
import { createPocketBase } from "~/lib/pocketbase";
import {
  createCategoryService,
  createProductService,
  type CategoryServiceOptions,
} from "~/lib/services";
import { translations } from "~/lib/translations";

type LoaderCategory = CategoryRecord;

interface CategoryLoaderData {
  category: LoaderCategory;
  products: ProductRecord[];
}

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { category?: string };
}): Promise<CategoryLoaderData> {
  const pb = createPocketBase(request);
  const categoryService = createCategoryService(pb);
  const productService = createProductService(pb);

  const category = await categoryService.getBySlug(params.category || "");
  if (!category) {
    throw new Response("Category not found", { status: 404 });
  }

  const productOptions: Omit<CategoryServiceOptions, "filter"> = {};

  const products = await productService.getByCategory(category.id, {
    expand: "sizes,collection,category",
  });

  // Ensure 'products' are returned as ProductRecord[]
  return { category, products: products as ProductRecord[] };
}

export const CategoryPage = () => {
  const { language } = useLanguage();
  const loaderData = useLoaderData() || {};
  const { category = {}, products = [] } = loaderData as CategoryLoaderData;

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"name-asc" | "name-desc">(
    "name-asc"
  );

  const langKey = language === "pt" ? "pt" : "en";
  const t = translations[langKey].category;

  const sizeOptions = useMemo(() => {
    const sizesSet = new Set<string>();
    products.forEach((product) => {
      const sizes = (product as any).expand?.sizes || [];
      sizes.forEach((s: any) => {
        if (s?.number) sizesSet.add(s.number);
      });
    });
    return Array.from(sizesSet).sort((a, b) => parseFloat(a) - parseFloat(b));
  }, [products]);

  const collectionOptions = useMemo(() => {
    const colSet = new Set<string>();
    products.forEach((product) => {
      const cols = (product as any).expand?.collection || [];
      cols.forEach((c: any) => {
        const name = c?.[`name_${langKey}`];
        if (name) colSet.add(name);
      });
    });
    return Array.from(colSet).sort((a, b) => a.localeCompare(b));
  }, [products, langKey]);

  const toggleSelection = (
    value: string,
    current: string[],
    setter: (next: string[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const filteredProducts = useMemo(() => {
    const list = products.filter((product) => {
      const expand = (product as any).expand || {};
      const productSizes: string[] = (expand.sizes || []).map(
        (s: any) => s.number
      );
      const productCollections: string[] = (expand.collection || []).map(
        (c: any) => c?.[`name_${langKey}`] || ""
      );

      if (
        selectedSizes.length &&
        !selectedSizes.some((s) => productSizes.includes(s))
      ) {
        return false;
      }

      if (
        selectedCollections.length &&
        !selectedCollections.some((c) => productCollections.includes(c))
      ) {
        return false;
      }

      return true;
    });

    const nameKey = `name_${langKey}` as keyof ProductRecord;
    return list.sort((a, b) => {
      const aName = ((a as any)[nameKey] as string) ?? "";
      const bName = ((b as any)[nameKey] as string) ?? "";
      return sortOrder === "name-asc"
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName);
    });
  }, [products, selectedSizes, selectedCollections, sortOrder, langKey]);

  const title =
    (category as any)[`name_${langKey}`] ?? (category as any)?.slug ?? "";

  return (
    <section className="bg-[#f1f1f1] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-34">
        <motion.h1
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl md:text-5xl font-semibold tracking-tight text-black mb-8"
        >
          {title}
        </motion.h1>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          <motion.aside
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1.2 }}
            className="w-full md:w-64 md:flex-shrink-0 rounded-2xl bg-white/80 p-4 md:p-6"
          >
            <h2 className="text-sm font-semibold text-neutral-800 mb-4 uppercase tracking-wide">
              {t.filters}
            </h2>

            <div className="mb-6">
              <p className="text-xs font-medium text-neutral-500 mb-2 uppercase">
                {t.size}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      toggleSelection(size, selectedSizes, setSelectedSizes)
                    }
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      selectedSizes.includes(size)
                        ? "bg-black text-white border-black"
                        : "bg-white text-neutral-800 border-neutral-300 hover:border-black/60"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-medium text-neutral-500 mb-2 uppercase">
                {t.collection}
              </p>
              <div className="flex flex-col gap-1">
                {collectionOptions.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() =>
                      toggleSelection(
                        col,
                        selectedCollections,
                        setSelectedCollections
                      )
                    }
                    className={`text-left text-xs px-2 py-1 rounded-md transition-colors ${
                      selectedCollections.includes(col)
                        ? "bg-black text-white"
                        : "bg-transparent text-neutral-800 hover:bg-neutral-100"
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2 uppercase">
                {t.order}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSortOrder("name-asc")}
                  className={`flex-1 text-xs px-3 py-1 rounded-full border transition-colors ${
                    sortOrder === "name-asc"
                      ? "bg-black text-white border-black"
                      : "bg-white text-neutral-800 border-neutral-300 hover:border-black/60"
                  }`}
                >
                  {t.aToZ}
                </button>
                <button
                  type="button"
                  onClick={() => setSortOrder("name-desc")}
                  className={`flex-1 text-xs px-3 py-1 rounded-full border transition-colors ${
                    sortOrder === "name-desc"
                      ? "bg-black text-white border-black"
                      : "bg-white text-neutral-800 border-neutral-300 hover:border-black/60"
                  }`}
                >
                  {t.zToA}
                </button>
              </div>
            </div>
          </motion.aside>

          <main className="flex-1 w-full">
            {filteredProducts.length === 0 ? (
              <p className="text-sm text-neutral-500">{t.noProducts}</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index / 10, duration: 1.2 }}
                    className="w-full"
                  >
                    <ProductCard
                      name={
                        (product[
                          `name_${langKey}` as keyof ProductRecord
                        ] as string) ?? ""
                      }
                      media={{
                        image: product.media?.[0] ?? "",
                        hover: product.media_hover ?? "",
                      }}
                      link={`/product/${product.slug}`}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

export default CategoryPage;
