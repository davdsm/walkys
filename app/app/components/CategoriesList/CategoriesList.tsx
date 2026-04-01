import { motion } from "framer-motion";
import type { TranslatedProduct, TranslatedCategory } from "~/lib/services";
import ProductCard from "~/components/Cards/ProductCard";
import { resolveProductCardMedia } from "~/lib/product-media";

interface CategoryWithProducts extends TranslatedCategory {
  products: TranslatedProduct[];
}

interface CategoriesListProps {
  categories: CategoryWithProducts[];
  language: string;
}

export const CategoriesList = ({
  categories,
  language,
}: CategoriesListProps) => {
  return (
    <div className="list px-4">
      {categories.map((category: CategoryWithProducts, indexC: number) => (
        <div
          id={category.slug}
          key={category.slug}
          className="flex justify-start items-center flex-wrap flex-column py-8 w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.2, once: true }}
            transition={{ delay: 0.5 + indexC / 8, duration: 1.2 }}
            className="flex justify-start w-full py-8"
          >
            <div>
              <h1 className="text-4xl font-display">
                {category.name}
                <hr className="border-2 w-1/2 my-2 rounded" />
              </h1>
              {category.description && (
                <p className="text-sm text-slate-500 mt-1 max-w-xl">{category.description}</p>
              )}
            </div>
          </motion.div>
          <ul className="w-full flex flex-row gap-3 justify-start items-start flex-wrap">
            {category.products.map(
              (product: TranslatedProduct, indexP: number) => (
                <motion.li
                  key={product.id}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.2, once: true }}
                  transition={{
                    delay: 0.5 + indexP / 8,
                    duration: 1.2,
                  }}
                  className="w-[calc(50%-6px)] md:w-[calc(25%-9px)]"
                >
                  <ProductCard
                    name={product.name}
                    media={resolveProductCardMedia(product)}
                    link={`/product/${product.slug}`}
                  />
                </motion.li>
              )
            )}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default CategoriesList;
