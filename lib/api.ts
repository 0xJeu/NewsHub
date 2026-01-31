import { Article } from "@/types";
import { assignCategory } from "./utils";

const query = [
  "google",
  "apple",
  "microsoft",
  "amazon",
  "tesla",
  "spacex",
  "openai",
  "chatgpt",
  "space",
  "bitcoin",
  "ethereum",
  "crypto",
  "blockchain",
  "web3",
  "ai",
];

export async function fetchArticles(page = 1, pageSize = 100, searchQuery?: string): Promise<Article[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    throw new Error("NEWS_API_KEY is not defined in environment variables");
  }

  // Calculate the 'from' date to be 30 days ago to get recent news
  const date = new Date();
  date.setDate(date.getDate() - 30);
  const fromDate = date.toISOString().split('T')[0];

  const q = searchQuery || query.join(" OR ");

  const response = await fetch(
    `https://newsapi.org/v2/everything?q=${q}&apiKey=${apiKey}&pageSize=${pageSize}&page=${page}&from=${fromDate}&sortBy=publishedAt&language=en`,
    { next: { revalidate: 3600, tags: ['articles'] } } // Cache for 1 hour
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch articles: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.articles) {
    return [];
  }

  return data.articles
    .filter(
      (article: any) =>
        article.title &&
        article.description &&
        !article.title.includes("[Removed]") &&
        !article.description.includes("[Removed]")
    )
    .map((article: any, index: number) => ({
      id: index + (page - 1) * pageSize, // Ensure unique IDs across pages
      title: article.title || "Untitled",
      description: article.description || "No description available",
      url: article.url || "#",
      urlToImage: article.urlToImage || "/placeholder-image.jpg",
      publishedAt: article.publishedAt || new Date().toISOString(),
      category: assignCategory(article.title, article.description),
    }));
}
