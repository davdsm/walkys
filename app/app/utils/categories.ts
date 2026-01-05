import type { ProductRecord, CategoryRecord } from "../hooks";

export function mapCategoriesWithProducts(categories: CategoryRecord[], products: ProductRecord[]) {
  return categories.map((category) => ({
    ...category,
    products: products.filter((product) => {
      if (Array.isArray(product.expand?.category)) {
        return product.expand.category.some((c: CategoryRecord) => c?.id === category.id);
      } else if (typeof product.category === "string") {
        return product.category === category.id;
      } else if (Array.isArray(product.category)) {
        return product.category.includes(category.id as never);
      }
      return false;
    }),
  }));
}

