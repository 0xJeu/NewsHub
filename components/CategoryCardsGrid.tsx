import Link from "next/link";
import { CATEGORY_CARDS, CategoryCardConfig } from "@/lib/config/category-cards";

interface CategoryCardsGridProps {
  cards?: CategoryCardConfig[];
  variant?: "home" | "categories";
}

export default function CategoryCardsGrid({
  cards = CATEGORY_CARDS,
  variant = "home",
}: CategoryCardsGridProps) {
  const isCategoriesVariant = variant === "categories";

  const gridClassName = isCategoriesVariant
    ? "grid gap-8 md:grid-cols-2 lg:grid-cols-3"
    : "grid gap-6 md:grid-cols-2 lg:grid-cols-3";

  const cardClassName = isCategoriesVariant
    ? "group p-10 md:p-12 rounded-3xl border hover:shadow-lg transition-all duration-300 text-center"
    : "group p-8 rounded-2xl border hover:shadow-md transition-all duration-300 text-center";

  const iconClassName = isCategoriesVariant ? "text-5xl mb-4" : "text-4xl mb-3";
  const titleClassName = isCategoriesVariant ? "text-2xl font-bold mb-3" : "text-xl font-bold mb-2";
  const ctaClassName = isCategoriesVariant
    ? "text-base font-semibold opacity-75 group-hover:opacity-100 transition-opacity"
    : "text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity";

  return (
    <div className={gridClassName}>
      {cards.map((category) => (
        <Link
          key={category.slug}
          href={`/categories/${category.slug}`}
          className={`${cardClassName} ${category.color}`}
        >
          <div className={iconClassName}>{category.icon}</div>
          <h3 className={titleClassName}>{category.name}</h3>
          <span className={ctaClassName}>Browse Articles →</span>
        </Link>
      ))}
    </div>
  );
}
