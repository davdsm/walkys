import { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { HomeHero } from "~/components/HomeHero";
import { ProductCarousel } from "~/components/ProductCarousel";
import CategoryCard from "~/components/Cards/CategoryCard";
import CategoriesList from "~/components/CategoriesList/CategoriesList";
import { SmallCTA } from "~/components/SmallCTA";
import { useLanguage, useHeaderBackground } from "~/contexts";

import type { Route } from "./+types/home";
import { createPocketBase, getUserAllowedProductIds } from "~/lib/pocketbase";
import {
  createCategoryService,
  createPageService,
  createProductService,
} from "~/lib/services";
import { mapCategoriesWithProducts } from "~/utils/categories";
import { useLoaderData } from "react-router";
import { getLanguageFromRequest } from "~/lib/utils";
import HomepageCard from "~/components/Cards/HomepageCard";
import { buildSeoMeta, DEFAULT_DESCRIPTION } from "~/lib/seo";
import { resolveProductCardMedia } from "~/lib/product-media";

// Loader: Fetch data on the server/route level. Homepage is public; product filtering applies only when user is logged in and has products assigned.
export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  const user = pb.authStore.isValid ? (pb.authStore.model as { id?: string; admin?: boolean } | null) : null;
  const allowedIds = user?.id ? await getUserAllowedProductIds(pb, user) : null;

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
        let productIds = sliderProductsSection.products.filter(
          (id: any): id is string => typeof id === "string",
        );
        if (allowedIds?.length) productIds = productIds.filter((id: string) => allowedIds.includes(id));
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
        homepageProducts = sliderProductsSection.products;
        if (allowedIds?.length) homepageProducts = homepageProducts.filter((p: any) => p?.id && allowedIds.includes(p.id));
      }
    }

    // Fallback to featured products if no products found in homepage
    let featuredProducts: any[];
    if (homepageProducts.length > 0) {
      featuredProducts = homepageProducts;
    } else if (allowedIds?.length) {
      featuredProducts = await productService.getByIds(allowedIds, {
        expand: "sizes,collection,category",
      });
      featuredProducts = featuredProducts.slice(0, 6);
    } else {
      featuredProducts = await productService.getFeatured(6, {
        expand: "sizes,collection,category",
      });
    }

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
        let products = await productService.getByCategoryIds(
          listCategoryIds,
          { expand: "category,sizes" },
        );
        if (allowedIds?.length) products = products.filter((p: any) => allowedIds.includes(p.id));
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

export function meta({ data }: Route.MetaArgs) {
  const heroTitle =
    data?.homepageData?.find((section) => section.section_id === "intro-title")?.value;
  const heroSubtitle =
    data?.homepageData?.find((section) => section.section_id === "intro-text")?.value;

  return buildSeoMeta({
    title: heroTitle || "Portuguese Shoes",
    description: heroSubtitle || DEFAULT_DESCRIPTION,
    pathname: "/",
    type: "website",
    keywords: [
      "portuguese shoes",
      "handmade shoes portugal",
      "walkys footwear",
      "elegant leather shoes",
    ],
  });
}

const HERO_BG = "#ffffff";
const DEFAULT_BG = "#f1f1f1";

export const Home = () => {
  const data = useLoaderData<typeof loader>();
  const { t } = useLanguage();
  const lastDataRef = useRef(data);
  const carouselRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroInView, setHeroInView] = useState(true);
  const { setDarkBackground } = useHeaderBackground();

  // Sync hero-in-view to header so it can show inverted logo + light menu on black background
  useEffect(() => {
    setDarkBackground(heroInView);
    return () => setDarkBackground(false);
  }, [heroInView, setDarkBackground]);

  // Reset scroll position on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // Body background: black when hero is in view, #f1f1f1 when scrolled past hero
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const setBodyBg = (color: string) => {
      document.body.style.transition = "background-color 0.5s ease";
      document.body.style.backgroundColor = color;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const inView = !!entry?.isIntersecting;
        setHeroInView(inView);
        setBodyBg(inView ? HERO_BG : DEFAULT_BG);
      },
      // Negative top rootMargin: switch to light bg earlier (when hero has scrolled up ~25% of viewport)
      { threshold: 0.1, rootMargin: "-25% 0px 0px 0px" },
    );

    setBodyBg(HERO_BG);
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

  const introProductSection = homepageData.find((p) => p.section_id === "intro-product");
  const introCategoriesSection = homepageData.find((p) => p.section_id === "intro-categories");

  const heroSection = {
    title: homepageData.find((p) => p.section_id === "intro-title")?.value ?? "",
    subtitle: homepageData.find((p) => p.section_id === "intro-text")?.value ?? "",
    product: introProductSection?.products?.[0] ?? null,
    categories:
      introCategoriesSection?.categories?.map((c: any) => ({
        name: c.name,
        link: `/category/${c.slug}`,
      })) ?? [],
  };

  const sliderListSection = homepageData.find((p) => p.section_id === "slider-products-list");

  const productSliderSection = {
    title: homepageData.find((p) => p.section_id === "slider-products-title")?.value ?? "",
    subtitle: homepageData.find((p) => p.section_id === "slider-products-subtitle")?.value ?? "",
    products: sliderListSection?.products ?? [],
    ctaText: homepageData.find((p) => p.section_id === "slider-products-cta-text")?.value ?? undefined,
    ctaLink: homepageData.find((p) => p.section_id === "slider-products-cta-link")?.value ?? undefined,
  };

  return (
    <section className="w-full max-w-full overflow-x-hidden flex flex-col items-start justify-start relative transition-colors duration-500">
      <div ref={heroRef} className="w-full">
        <HomeHero
          title={heroSection.title}
          subtitle={heroSection.subtitle}
          product={heroSection.product ? {
            image: heroSection.product.media?.[0] ?? "",
            name: heroSection.product.name ?? "",
            link: `/product/${heroSection.product.slug}`,
          } : { image: "", name: "", link: "/" }}
          categories={heroSection.categories}
          dark={heroInView}
        />
      </div>

      <motion.article
        className="p-6 lg:p-20 w-full"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ amount: 0.5, once: true }}
      >
        {featuredProducts?.length > 0 && (
          <div ref={carouselRef}>
            <ProductCarousel
              title={productSliderSection.title}
              subtitle={productSliderSection.subtitle}
              cards={featuredProducts.map((p) => ({
                id: p.id,
                name: p.name,
                media: resolveProductCardMedia(p),
                link: `/product/${p.slug}`,
              }))}
              ctaText={productSliderSection.ctaText ?? t.home.exploreMore}
              ctaLink={productSliderSection.ctaLink ?? "/collection/autmn-winter-25"}
            />
          </div>
        )}
      </motion.article>

      <motion.article
        className="w-full px-4 md:px-20 flex flex-col gap-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ amount: 0.5, once: true }}
      >
        {(categoriesSectionTitle || categoriesSectionSubtitle) && (
          <div className="text-center space-y-1">
            {categoriesSectionTitle && (
              <h2 className="text-2xl md:text-4xl font-bold text-slate-900">
                {categoriesSectionTitle}
              </h2>
            )}
            {categoriesSectionSubtitle && (
              <p className="text-slate-600 w-full max-w-2xl mx-auto px-4 sm:px-6 md:px-12 pt-2 text-center">{categoriesSectionSubtitle}</p>
            )}
          </div>
        )}
        <div className="flex flex-col w-full justify-between gap-10">
          {featureCategories?.map((featureCategory, index) => (
            <div key={featureCategory.id} className="w-full">
              <HomepageCard
                variant="dark"
                cardImage={{
                  image: featureCategory.media,
                }}
                title={featureCategory.name}
                subtitle={featureCategory.description ?? ""}
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
      </motion.article>

      <motion.article
        className="w-full pt-8 md:px-20 rounded-xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ amount: 0.5, once: true }}
      >
        <SmallCTA />
      </motion.article>
    </section>
  );
};

export default Home;
