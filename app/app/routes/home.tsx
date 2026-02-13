import { useRef, useEffect } from "react";
import { HomeHero } from "~/components/HomeHero";
import { ProductCarousel } from "~/components/ProductCarousel";
import CategoryCard from "~/components/Cards/CategoryCard";
import CategoriesList from "~/components/CategoriesList/CategoriesList";
import { SmallCTA } from "~/components/SmallCTA";
import { useLanguage } from "~/contexts";

import type { Route } from "./+types/home";
import { createPocketBase } from "~/lib/pocketbase";
import {
  createCategoryService,
  createPageService,
  createProductService,
} from "~/lib/services";
import { mapCategoriesWithProducts } from "~/utils/categories";
import { useLoaderData } from "react-router";
import { getLanguageFromRequest } from "~/lib/utils";
import HomepageCard from "~/components/Cards/HomepageCard";

// Loader: Fetch data on the server/route level
export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  const language = getLanguageFromRequest(request);

  const pageService = createPageService(pb, "Homepage", language);
  const productService = createProductService(pb, language);
  const categoryService = createCategoryService(pb, language);

  try {
    const homepageData = await pageService.getAll();

    // Get products from the slider-products-list section
    const sliderProductsSection = homepageData.find(
      (p) => p.section_id === "slider-products-list",
    );

    let homepageProducts: any[] = [];

    if (
      sliderProductsSection?.products &&
      Array.isArray(sliderProductsSection.products)
    ) {
      // Check if products are already expanded (objects with id property) or just IDs (strings)
      const firstProduct = sliderProductsSection.products[0];

      if (typeof firstProduct === "string") {
        // Products are just IDs, fetch them
        const productIds = sliderProductsSection.products.filter(
          (id: any): id is string => typeof id === "string",
        );
        if (productIds.length > 0) {
          homepageProducts = await productService.getByIds(productIds, {
            expand: "sizes,collection,category",
          });
        }
      } else if (
        firstProduct &&
        typeof firstProduct === "object" &&
        "id" in firstProduct
      ) {
        // Products are already expanded by PageService, use them directly
        // They should already be transformed by PageService
        homepageProducts = sliderProductsSection.products;
      }
    }

    // Fallback to featured products if no products found in homepage
    const featuredProducts =
      homepageProducts.length > 0
        ? homepageProducts
        : await productService.getFeatured(6, {
            expand: "sizes,collection,category",
          });

    // Card categories: prefer "categories-section-highlighted"; fallback to "categories-section-list" (backward compat)
    const categoriesSectionHighlighted = homepageData.find(
      (p) => p.section_id === "categories-section-highlighted",
    );
    const categoriesSectionList = homepageData.find(
      (p) => p.section_id === "categories-section-list",
    );
    const categoriesSectionTitle = homepageData.find(
      (p) => p.section_id === "categories-section-title",
    );
    const categoriesSectionSubtitle = homepageData.find(
      (p) => p.section_id === "categories-section-subtitle",
    );

    const highlightedCategories =
      categoriesSectionHighlighted?.categories &&
      Array.isArray(categoriesSectionHighlighted.categories) &&
      categoriesSectionHighlighted.categories.length > 0
        ? categoriesSectionHighlighted.categories
        : null;
    const useHighlightedForCards = !!highlightedCategories?.length;

    let featureCategories: any[] = [];
    if (useHighlightedForCards) {
      featureCategories = highlightedCategories;
    } else if (
      categoriesSectionList?.categories &&
      Array.isArray(categoriesSectionList.categories) &&
      categoriesSectionList.categories.length > 0
    ) {
      featureCategories = categoriesSectionList.categories;
    } else {
      try {
        featureCategories = await categoryService.getFeatured(2);
      } catch {
        featureCategories = [];
      }
    }

    // List below (categories + products): only when cards come from highlighted; then list comes from categories-section-list
    let listCategoriesWithProducts: Awaited<
      ReturnType<typeof mapCategoriesWithProducts>
    > = [];
    if (
      useHighlightedForCards &&
      categoriesSectionList?.categories &&
      Array.isArray(categoriesSectionList.categories) &&
      categoriesSectionList.categories.length > 0
    ) {
      const listCategories = categoriesSectionList.categories;
      const listCategoryIds = listCategories
        .map((c: any) => (typeof c === "string" ? c : c?.id))
        .filter(Boolean) as string[];
      if (listCategoryIds.length > 0) {
        const listCats = listCategories.every(
          (c: any) => typeof c === "object" && c?.id,
        )
          ? (listCategories as any[])
          : await categoryService.getByIds(listCategoryIds);
        const products = await productService.getByCategoryIds(
          listCategoryIds,
          { expand: "category,sizes" },
        );
        listCategoriesWithProducts = mapCategoriesWithProducts(
          listCats,
          products,
        );
      }
    }

    return {
      homepageData,
      featuredProducts,
      featureCategories,
      listCategoriesWithProducts,
      categoriesSectionTitle: categoriesSectionTitle?.value,
      categoriesSectionSubtitle: categoriesSectionSubtitle?.value,
      language,
    };
  } catch (error) {
    console.error("Error loading homepage:", error);
    return {
      homepageData: [],
      featuredProducts: [],
      featureCategories: [],
      listCategoriesWithProducts: [],
      categoriesSectionTitle: undefined,
      categoriesSectionSubtitle: undefined,
      language,
    };
  }
}

const HERO_BG = "#ffffff";
const DEFAULT_BG = "#f1f1f1";

export const Home = () => {
  const data = useLoaderData<typeof loader>();
  const { t } = useLanguage();
  const lastDataRef = useRef(data);
  const carouselRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Reset scroll position on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // Body background: white when hero is in view, #f1f1f1 when leaving hero section
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const setBodyBg = (color: string) => {
      document.body.style.transition = "background-color 0.4s ease";
      document.body.style.backgroundColor = color;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setBodyBg(entry?.isIntersecting ? HERO_BG : DEFAULT_BG);
      },
      { threshold: 0.1, rootMargin: "0px" },
    );

    setBodyBg(DEFAULT_BG);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.body.style.backgroundColor = "";
      document.body.style.transition = "";
    };
  }, []);

  // Update ref if we have new data
  if (data) {
    lastDataRef.current = data;
  }

  // Use current data or fallback to last known data
  const effectiveData = data || lastDataRef.current;

  if (!effectiveData) return null;

  const {
    homepageData,
    featuredProducts,
    featureCategories,
    listCategoriesWithProducts,
    categoriesSectionTitle,
    categoriesSectionSubtitle,
    language,
  } = effectiveData;

  const heroSection = {
    title: homepageData.find((p) => p.section_id === "intro-title").value,
    subtitle: homepageData.find((p) => p.section_id === "intro-text").value,
    product: homepageData.find((p) => p.section_id === "intro-product")
      .products[0],
    categories:
      homepageData
        .find((p) => p.section_id === "intro-categories")
        .categories.map((c: any) => ({
          name: c.name,
          link: `/category/${c.slug}`,
        })) || [],
  };

  const productSliderSection = {
    title: homepageData.find((p) => p.section_id === "slider-products-title")
      .value,
    subtitle: homepageData.find(
      (p) => p.section_id === "slider-products-subtitle",
    ).value,
    products: homepageData.find((p) => p.section_id === "slider-products-list")
      .products,
  };

  return (
    <section className="w-full flex flex-col items-start justify-start relative transition-colors duration-500">
      <div ref={heroRef} className="w-full">
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
      </div>

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
              ctaText={t.home.exploreMore}
              ctaLink="/collection/autmn-winter-25"
            />
          </div>
        )}
      </article>

      <article className="w-full px-4 md:px-20 flex flex-col gap-6">
        {(categoriesSectionTitle || categoriesSectionSubtitle) && (
          <div className="text-center space-y-1">
            {categoriesSectionTitle && (
              <h2 className="text-2xl font-bold text-slate-900">
                {categoriesSectionTitle}
              </h2>
            )}
            {categoriesSectionSubtitle && (
              <p className="text-slate-600">{categoriesSectionSubtitle}</p>
            )}
          </div>
        )}
        <div className="flex flex-col w-full justify-between gap-10">
          {featureCategories?.map((featureCategory, index) => (
            <div key={featureCategory.id} className="w-full">
              <HomepageCard
                variant="light"
                cardImage={{
                  image: featureCategory.media,
                }}
                title={featureCategory.name}
                subtitle={featureCategory.description || 'bla bla bla'}
                link={`/category/${featureCategory.slug}`}
              />
            </div>
          ))}
        </div>
        {listCategoriesWithProducts?.length > 0 && (
          <CategoriesList
            categories={listCategoriesWithProducts}
            language={language}
          />
        )}
      </article>

      <article className="w-full pt-8 md:px-20 rounded-xl">
        <SmallCTA />
      </article>
    </section>
  );
};

export default Home;
