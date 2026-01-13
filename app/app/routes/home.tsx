import { useRef } from "react";
import { HomeHero } from "~/components/HomeHero";
import { ProductCarousel } from "~/components/ProductCarousel";
import CategoryCard from "~/components/Cards/CategoryCard";
import { SmallCTA } from "~/components/SmallCTA";

import type { Route } from "./+types/home";
import { createPocketBase } from "~/lib/pocketbase";
import {
  createCategoryService,
  createPageService,
  createProductService,
} from "~/lib/services";
import { useLoaderData } from "react-router";
import { getLanguageFromRequest } from "~/lib/utils";

// Loader: Fetch data on the server/route level
export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  const language = getLanguageFromRequest(request);

  const pageService = createPageService(pb, "Homepage", language);
  const productService = createProductService(pb, language);
  const categoryService = createCategoryService(pb, language);

  try {
    const homepageData = await pageService.getAll();

    const featuredProducts = await productService.getFeatured(6, {
      expand: "sizes,collection,category",
    });

    const featureCategories = await categoryService.getFeatured(2);

    return { homepageData, featuredProducts, featureCategories, language };
  } catch (error) {
    console.error("Error loading homepage:", error);
    return {
      homepageData: [],
      featuredProducts: [],
      featureCategories: [],
      language,
    };
  }
}

export const Home = () => {
  const data = useLoaderData<typeof loader>();
  const lastDataRef = useRef(data);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Update ref if we have new data
  if (data) {
    lastDataRef.current = data;
  }

  // Use current data or fallback to last known data
  const effectiveData = data || lastDataRef.current;

  if (!effectiveData) return null;

  const { homepageData, featuredProducts, featureCategories, language } =
    effectiveData;

  const heroSection = {
    title: homepageData.find((p) => p.section_id === "intro-title").value,
    subtitle: homepageData.find((p) => p.section_id === "intro-text").value,
    product: homepageData.find((p) => p.section_id === "intro-product")
      .products[0],
    categories: homepageData.find((p) => p.section_id === "intro-categories")
      .categories,
  };

  const productSliderSection = {
    title: homepageData.find((p) => p.section_id === "slider-products-title")
      .value,
    subtitle: homepageData.find(
      (p) => p.section_id === "slider-products-subtitle"
    ).value,
    products: homepageData.find((p) => p.section_id === "slider-products-list")
      .products,
  };

  return (
    <section className="w-full min-h-screen flex flex-col items-start justify-start relative overflow-x-hidden transition-colors duration-500 bg-[#f1f1f1]">
      <HomeHero
        title={heroSection.title}
        subtitle={heroSection.subtitle}
        product={{
          image: heroSection.product.media[0],
          name: heroSection.product.name,
          link: `/product/${heroSection.product.slug}`,
        }}
        categories={heroSection.categories}
      />

      <article className="p-6 lg:p-20 w-full">
        {featuredProducts?.length > 0 && (
          <div ref={carouselRef}>
            <ProductCarousel
              title={productSliderSection.title}
              subtitle={productSliderSection.subtitle}
              cards={featuredProducts.map((p) => ({
                id: p.id,
                name: p.name,
                media: {
                  image: p.media[0] || "",
                  hover: p.media_hover || p.media[1] || p.media[0] || "",
                },
                link: `/product/${p.slug}`,
              }))}
              ctaText={language === "pt" ? "EXPLORAR MAIS" : "EXPLORE MORE"}
              ctaLink="/collection/autmn-winter-25"
            />
          </div>
        )}
      </article>

      <article className="w-full px-4 md:px-20 flex justify-between gap-10">
        {featureCategories?.map((featureCategory, index) => (
          <div
            key={featureCategory.id}
            className={`${featureCategories?.length === 1 ? "w-full" : `md:w-1/2 w-full ${index === 1 ? "hidden md:block" : ""}`}`}
          >
            <CategoryCard
              name={featureCategory.name}
              description={featureCategory.description}
              media={{
                image: featureCategory.media,
                hover: featureCategory.hover,
              }}
              link={`/category/${featureCategory.slug}`}
            />
          </div>
        ))}
      </article>

      <article className="w-full pt-8 md:px-20 rounded-xl">
        <SmallCTA />
      </article>
    </section>
  );
};

export default Home;
