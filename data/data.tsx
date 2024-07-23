import { useEffect, useState } from "react";
import axios from "axios";

interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  category: string;
}

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

const fetchArticles = async (): Promise<Article[]> => {
  const response = await axios.get(
    `https://newsapi.org/v2/everything?q=${query.join(
      " OR "
    )}&from=2024-07-21&to=2024-07-21&sortBy=popularity&apiKey=116a22b0ce47436481d7393237908bab`
  );
  return response.data.articles.map((article: any, index: number) => ({
    id: index,
    title: article.title || "Untitled",
    description: article.description || "No description available",
    url: article.url || "#",
    urlToImage: article.urlToImage || "/placeholder-image.jpg",
    category: assignCategory(article.title, article.description),
  }));
};

const assignCategory = (title: string, description: string): string => {
  const content = (title + " " + description).toLowerCase();
  if (
    content.includes("politic") ||
    content.includes("government") ||
    content.includes("election")
  ) {
    return "Politics";
  } else if (
    content.includes("tech") ||
    content.includes("software") ||
    content.includes("ai")
  ) {
    return "Technology";
  } else if (
    content.includes("science") ||
    content.includes("research") ||
    content.includes("study")
  ) {
    return "Science";
  } else if (
    content.includes("movie") ||
    content.includes("music") ||
    content.includes("celebrity")
  ) {
    return "Entertainment";
  } else if (
    content.includes("sport") ||
    content.includes("athlete") ||
    content.includes("game")
  ) {
    return "Sports";
  } else if (
    content.includes("health") ||
    content.includes("medical") ||
    content.includes("disease")
  ) {
    return "Health";
  } else {
    return "General";
  }
};

const useCachedArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const cachedArticles = localStorage.getItem("articles");
    const cachedTimestamp = localStorage.getItem("articlesTimestamp");
    const currentTime = new Date().getTime();
    const cacheExpirationTime = 60 * 60 * 1000; // 1 hour in milliseconds

    if (
      cachedArticles &&
      cachedTimestamp &&
      currentTime - parseInt(cachedTimestamp) < cacheExpirationTime
    ) {
      setArticles(JSON.parse(cachedArticles));
    } else {
      fetchArticles().then((fetchedArticles) => {
        setArticles(fetchedArticles);
        localStorage.setItem("articles", JSON.stringify(fetchedArticles));
        localStorage.setItem("articlesTimestamp", currentTime.toString());
      });
    }
  }, []);

  return articles;
};

export { useCachedArticles };
