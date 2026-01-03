import { Link } from "react-router";
import { motion } from "motion/react";
import AnimatedBackground from "~/components/Elements/AnimatedBackground/AnimatedBackground";
import { Button } from "~/components/Elements/Button/Button";
import {
  useAuth,
  useCategories,
  useProducts,
  useTranslatedContent,
} from "~/hooks";
import type { PageRecord } from "~/lib/services";
import CategoryCard from "~/components/Cards/CategoryCard/";
import ProductCard from "~/components/Cards/ProductCard/";

interface WelcomeProps {
  homepageData: PageRecord[];
}

export const Welcome = ({ homepageData }: WelcomeProps) => {
  const { user, isAuthenticated } = useAuth();
  const { getContent } = useTranslatedContent(homepageData);

  // Get translated content
  const title = getContent("intro-title");
  const text = getContent("intro-text");

  const { categories } = useCategories();
  const { products } = useProducts();

  return (
    <main className="w-full min-h-screen bg-gray-200 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {categories.length > 0 &&
          categories.map((category) => {
            if (!category.media) return;
            return (
              <CategoryCard
                key={category.name}
                name={category.name}
                description={category.description}
                media={{ image: category.media, hover: category.hover }}
                link={`/category/${category.link}`}
              />
            );
          })}
      </div>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        {products.map((product) => {
          return (
            <ProductCard
              key={product.name}
              name={product.name}
              media={{
                image: product.media[0],
                hover: product.media_hover,
              }}
              link={`/product/${product.slug}`}
            />
          );
        })}
      </div>
    </main>
  );
};
