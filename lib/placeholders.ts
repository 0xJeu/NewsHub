// Placeholder images for articles when the original image fails to load
export const placeholderImages = [
  "/api/placeholder/800/600?text=News+Image+1",
  "/api/placeholder/800/600?text=News+Image+2",
  "/api/placeholder/800/600?text=News+Image+3",
  "/api/placeholder/800/600?text=News+Image+4",
  "/api/placeholder/800/600?text=News+Image+5",
  "/api/placeholder/800/600?text=News+Image+6",
];

export const defaultPlaceholderImage = "/api/placeholder/800/600?text=News+Image";

export function isPlaceholderImage(src: string): boolean {
  return src.includes("/api/placeholder/") || placeholderImages.includes(src);
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
