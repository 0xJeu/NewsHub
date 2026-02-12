import { CATEGORIES } from "./categories";

export interface CategoryCardConfig {
  name: string;
  slug: string;
  icon: string;
  color: string;
}

const CARD_TONE_CLASSES: Record<string, string> = {
  slate: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800",
  gray: "bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800",
  zinc: "bg-zinc-50 text-zinc-700 border-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800",
  neutral: "bg-neutral-50 text-neutral-700 border-neutral-100 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800",
  stone: "bg-stone-50 text-stone-700 border-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-800",
  red: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  orange: "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900",
  amber: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  yellow: "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900",
  lime: "bg-lime-50 text-lime-700 border-lime-100 dark:bg-lime-950/40 dark:text-lime-300 dark:border-lime-900",
  green: "bg-green-50 text-green-700 border-green-100 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  teal: "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900",
  sky: "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900",
  blue: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900",
  violet: "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900",
  purple: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900",
  fuchsia: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-900",
  pink: "bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-900",
  rose: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
};

const DEFAULT_CARD_TONE = CARD_TONE_CLASSES.slate;

export function resolveCategoryCardColor(categoryColor: string): string {
  const match = categoryColor.match(/bg-([a-z]+)-\d+/);
  const tone = match?.[1];
  if (!tone) {
    return DEFAULT_CARD_TONE;
  }
  return CARD_TONE_CLASSES[tone] || DEFAULT_CARD_TONE;
}

export const CATEGORY_CARDS: CategoryCardConfig[] = CATEGORIES.map((category) => ({
  name: category.name,
  slug: category.slug,
  icon: category.icon,
  color: resolveCategoryCardColor(category.color),
}));
