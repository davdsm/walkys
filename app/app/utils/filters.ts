import type { TranslatedCategory } from "~/lib/services";
import type { MouseEventHandler } from "react";

export function getCategoryFilters({
  categories,
  allLabel,
  setActiveCategory,
}: {
  categories: TranslatedCategory[];
  allLabel: string;
  setActiveCategory: (c: string) => void;
}): Array<{
  id: string;
  text: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}> {
  const filters = categories.map((category) => ({
    id: category.id ?? "",
    text: category.name || "",
    onClick: () => {
      setActiveCategory(category.id);
      const section = document.getElementById(category.slug);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
  }));
  filters.unshift({
    id: "todos-0",
    text: allLabel,
    onClick: () => {
      setActiveCategory("todos-0");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });
  return filters;
}

