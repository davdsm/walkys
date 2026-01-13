import type { TranslatedCategory, TranslatedProduct } from "~/lib/services";

export function mapCategoriesWithProducts(categories: TranslatedCategory[], products: TranslatedProduct[]) {
  return categories.map((category) => ({
    ...category,
    products: products.filter((product: any) => {
      // Check expanded category
      const expandedCat = product.expand?.category;
      if (Array.isArray(expandedCat)) {
        if (expandedCat.some((c: any) => c?.id === category.id)) return true;
      } else if (expandedCat?.id === category.id) {
        return true;
      }

      // Check raw category IDs
      if (Array.isArray(product.category)) {
        return product.category.includes(category.id);
      } else if (product.category === category.id) {
        return true;
      }

      return false;
    }),
  }));
}

