import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import Filters from "~/components/Filters/Filters";
import CategoriesList from "~/components/CategoriesList";
import { useLanguage } from "~/contexts";
import { UserBackofficeLanguageSwitcher } from "~/components/Backoffice/UserBackofficeLanguageSwitcher";
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
    const { language: contextLanguage, t } = useLanguage();
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
        if (!Array.isArray(categories)) return [];
        return getCategoryFilters({
            categories: categories,
            allLabel: t?.common?.all ?? "All",
            setActiveCategory: setActiveCategory,
        });
    }, [categories, t]);

    const categoriesWithProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];
        if (!Array.isArray(categories)) return [];
        const mapped = mapCategoriesWithProducts(categories, products);
        // If we have products but no categories (e.g. products have no category relation), show one "Products" section
        if (mapped.length === 0 && products.length > 0) {
            return [
                {
                    id: "all",
                    slug: "products",
                    name: t.userBackoffice.products,
                    description: "",
                    media: "",
                    hover: "",
                    products,
                },
            ];
        }
        return mapped;
    }, [categories, products, resolvedLanguage, t]);

    return (
        <div className="min-h-screen w-full bg-[#f1f1f1] flex flex-col md:pt-10">
            <motion.main
                className="flex flex-col w-full"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <div className="pr-[45px] pl-[33px] max-w-[1200px] mx-auto w-full flex flex-wrap items-center justify-between gap-4 pt-[48px] pb-[20px]">
                    <Link
                        className="md:text-[15px] text-lg font-semibold flex items-center gap-[12px]"
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
                        {t.userBackoffice.dashboard}
                    </Link>
                    <UserBackofficeLanguageSwitcher />
                </div>

                <motion.section
                    className="pb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
                >
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

                <div>
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
                                        ? t.userBackoffice.noProductsAssigned
                                        : t.userBackoffice.noProductsFound}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                </motion.section>
            </motion.main>
        </div>
    );
}