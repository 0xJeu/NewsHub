import { CATEGORIES } from "./categories";

export interface CategoryCardConfig {
  name: string;
  slug: string;
  icon: string;
  color: string;
}

/**
 * Dynamic color palette for category cards
 * Colors are automatically assigned in rotation as categories are added
 * Add more color schemes here to expand the palette
 */
const COLOR_PALETTE = [
  // Warm colors
  "bg-red-50 text-red-700 border-red-100 dark:bg-red-950 dark:bg-opacity-40 dark:text-red-300 dark:border-red-900",
  "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950 dark:bg-opacity-40 dark:text-orange-300 dark:border-orange-900",
  "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950 dark:bg-opacity-40 dark:text-amber-300 dark:border-amber-900",
  "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950 dark:bg-opacity-40 dark:text-yellow-300 dark:border-yellow-900",
  
  // Cool colors
  "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950 dark:bg-opacity-40 dark:text-blue-300 dark:border-blue-900",
  "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950 dark:bg-opacity-40 dark:text-indigo-300 dark:border-indigo-900",
  "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950 dark:bg-opacity-40 dark:text-violet-300 dark:border-violet-900",
  "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950 dark:bg-opacity-40 dark:text-purple-300 dark:border-purple-900",
  
  // Nature colors
  "bg-green-50 text-green-700 border-green-100 dark:bg-green-950 dark:bg-opacity-40 dark:text-green-300 dark:border-green-900",
  "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950 dark:bg-opacity-40 dark:text-emerald-300 dark:border-emerald-900",
  "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950 dark:bg-opacity-40 dark:text-teal-300 dark:border-teal-900",
  "bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950 dark:bg-opacity-40 dark:text-cyan-300 dark:border-cyan-900",
  "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950 dark:bg-opacity-40 dark:text-sky-300 dark:border-sky-900",
  "bg-lime-50 text-lime-700 border-lime-100 dark:bg-lime-950 dark:bg-opacity-40 dark:text-lime-300 dark:border-lime-900",
  
  // Pink/Rose
  "bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950 dark:bg-opacity-40 dark:text-pink-300 dark:border-pink-900",
  "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100 dark:bg-fuchsia-950 dark:bg-opacity-40 dark:text-fuchsia-300 dark:border-fuchsia-900",
  "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950 dark:bg-opacity-40 dark:text-rose-300 dark:border-rose-900",
  
  // Neutrals (for additional categories)
  "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800",
  "bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800",
  "bg-zinc-50 text-zinc-700 border-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800",
];

/**
 * Get color for a category by index
 * Automatically cycles through the color palette
 */
function getCategoryColor(index: number): string {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

/**
 * Optional: Map specific category slugs to specific colors
 * If not defined, colors are assigned by index
 */
const CUSTOM_CATEGORY_COLORS: Record<string, string> = {
  // Example: Override color for specific categories
  // 'politics': COLOR_PALETTE[4], // blue
  // 'technology': COLOR_PALETTE[7], // purple
  // 'science': COLOR_PALETTE[8], // green
  // 'entertainment': COLOR_PALETTE[14], // pink
  // 'sports': COLOR_PALETTE[1], // orange
  // 'health': COLOR_PALETTE[0], // red
};

/**
 * Generate category cards with dynamic color assignment
 */
export const CATEGORY_CARDS: CategoryCardConfig[] = CATEGORIES.map((category, index) => ({
  name: category.name,
  slug: category.slug,
  icon: category.icon,
  color: CUSTOM_CATEGORY_COLORS[category.slug] || getCategoryColor(index),
}));

/**
 * Get color palette info (useful for debugging or UI tools)
 */
export function getColorPaletteInfo() {
  return {
    totalColors: COLOR_PALETTE.length,
    colors: COLOR_PALETTE,
    categoriesCount: CATEGORIES.length,
    colorUtilization: `${Math.ceil((CATEGORIES.length / COLOR_PALETTE.length) * 100)}%`,
  };
}
