import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import Filters from "~/components/Filters/Filters";
import CategoriesList from "~/components/CategoriesList";
import { useLanguage } from "~/contexts";
import { mapCategoriesWithProducts } from "~/utils/categories";
import { getCategoryFilters } from "~/utils/filters";
import { useScrollSpy } from "~/hooks/useScrollSpy";
import type { TranslatedCategory, TranslatedProduct } from "~/lib/services";

type CatalogPageProps = {
    products: TranslatedProduct[];
    categories: TranslatedCategory[];
    language: string;
    noProductsAssigned?: boolean;
};

export default function CatalogPage({products, categories, language, noProductsAssigned = false}: CatalogPageProps) {
    const { language: contextLanguage } = useLanguage();
    const [activeCategory, setActiveCategory] = useState("todos-0");
    const [showFilter, setShowFilter] = useState(false);
    const resolvedLanguage = language || contextLanguage || "en";

    // Sticky filter toggle on scroll
    useEffect(() => {
        const onScroll = () => {
            try {
                setShowFilter(window.scrollY > 200);
            } catch {
                // Silently handle errors during navigation
            }
        };
        window.addEventListener("scroll", onScroll);
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Scrollspy - only if we have categories
    useScrollSpy({
        categories: Array.isArray(categories) ? categories : [],
        setActiveCategory,
        offset: 200,
    });

    const filters = useMemo(() => {
        if (!Array.isArray(categories) || !resolvedLanguage) return [];
        return getCategoryFilters({
            categories: categories,
            language: resolvedLanguage,
            setActiveCategory: setActiveCategory,
        });
    }, [categories, resolvedLanguage]);

    const categoriesWithProducts = useMemo(() => {
        if (!Array.isArray(categories) || !Array.isArray(products)) return [];
        return mapCategoriesWithProducts(categories, products);
    }, [categories, products]);

    return (
        <div className="w-full bg-[#f1f1f1] flex flex-col md:pt-70">
            <main className="flex flex-col w-full">
                <div className="pr-[45px] pl-[33px] max-w-[1200px] mx-auto w-full">
                    <Link
                        className="md:text-[15px] text-lg pt-[48px] pb-[20px] font-semibold flex items-center gap-[12px]"
                        to="/dashboard"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className="h-[12px] w-[12px]"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                            />
                        </svg>
                        Dashboard
                    </Link>
                </div>

                {showFilter && filters.length > 0 && (
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
                        />
                    </motion.div>
                )}

                <section className="pb-10">
                    {filters.length > 0 && (
                        <div className="pr-[45px] pl-[33px] max-w-[1200px] mx-auto w-full">
                            <Filters
                                items={filters}
                                activeFilter={activeCategory}
                                delay={0.5}
                            />
                        </div>
                    )}

                    <div className="mx-auto max-w-7xl">
                        {categoriesWithProducts.length > 0 ? (
                            <CategoriesList categories={categoriesWithProducts} language={resolvedLanguage} />
                        ) : (
                            <div className="flex items-center justify-center py-20">
                                <p className="text-lg text-gray-500">
                                    {noProductsAssigned
                                        ? "No products have been assigned to your account. Please contact your administrator."
                                        : "No products found"}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}