import { useEffect } from "react";

interface UseScrollSpyOptions {
  categories: { id: string; slug: string }[];
  setActiveCategory: (id: string) => void;
  offset?: number;
}

export function useScrollSpy({ categories, setActiveCategory, offset = 200 }: UseScrollSpyOptions) {
  useEffect(() => {
    const scrollSpy = () => {
      if (!categories.length) return;
      let current = "todos-0";
      let currentSectionTop = -Infinity;
      categories.forEach((cat) => {
        const el = document.getElementById(cat.slug);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        if (window.scrollY + offset >= top && top > currentSectionTop) {
          current = cat.id;
          currentSectionTop = top;
        }
      });
      setActiveCategory(current);
    };
    window.addEventListener("scroll", scrollSpy);
    scrollSpy(); // Initial check
    return () => window.removeEventListener("scroll", scrollSpy);
  }, [categories, setActiveCategory, offset]);
}

