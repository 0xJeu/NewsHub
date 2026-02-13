// Placeholder images for articles when the original image fails to load
// Using Unsplash images for reliable, high-quality placeholders
export const placeholderImages = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop", // Technology
  "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&h=600&fit=crop", // Science
  "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop", // Politics
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop", // Business
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop", // Entertainment
  "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop", // Sports
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop", // Health
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop", // News
];

export const defaultPlaceholderImage = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=600&fit=crop";

export function isPlaceholderImage(src: string): boolean {
  return src.includes("images.unsplash.com") || placeholderImages.includes(src);
}

export function getPlaceholderForSeed(seed: string): string {
  // Create a simple hash from the seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % placeholderImages.length;
  return placeholderImages[index];
}

export function getNextPlaceholder(currentSrc: string, seed: string): string {
  if (!isPlaceholderImage(currentSrc)) {
    return getPlaceholderForSeed(seed);
  }

  const currentIndex = placeholderImages.indexOf(currentSrc);
  if (currentIndex === -1) {
    return getPlaceholderForSeed(seed);
  }

  const nextIndex = (currentIndex + 1) % placeholderImages.length;
  return placeholderImages[nextIndex];
}
