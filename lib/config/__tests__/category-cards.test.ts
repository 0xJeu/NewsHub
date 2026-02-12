import { CATEGORIES } from "../categories";
import { CATEGORY_CARDS, resolveCategoryCardColor } from "../category-cards";

describe("Category cards configuration", () => {
  it("should generate one card per category", () => {
    expect(CATEGORY_CARDS).toHaveLength(CATEGORIES.length);
  });

  it("should preserve slug, name, and icon from category config", () => {
    const categoryBySlug = new Map(CATEGORIES.map((category) => [category.slug, category]));

    CATEGORY_CARDS.forEach((card) => {
      const category = categoryBySlug.get(card.slug);
      expect(category).toBeDefined();
      expect(card.name).toBe(category?.name);
      expect(card.icon).toBe(category?.icon);
    });
  });

  it("should resolve known tone classes from category colors", () => {
    expect(resolveCategoryCardColor("bg-blue-500")).toContain("bg-blue-50");
    expect(resolveCategoryCardColor("bg-purple-500")).toContain("bg-purple-50");
    expect(resolveCategoryCardColor("bg-red-500")).toContain("bg-red-50");
  });

  it("should fall back to neutral card classes for unknown colors", () => {
    const fallback = resolveCategoryCardColor("bg-brand-500");
    expect(fallback).toContain("bg-slate-50");
    expect(fallback).toContain("dark:bg-slate-900");
  });
});
