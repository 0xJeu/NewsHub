"use client";

import ArticleCard from "@/Components/articleCard";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import NavBar from "@/Components/navBar";
import Footer from "@/Components/footer";
import { useCachedArticles } from "@/data/data";

interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  category: string;
}

export default function Home(): React.ReactElement {
  const articles = useCachedArticles();
  const [limitedArticles, setLimitedArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchAndValidateImages = async () => {
      const validatedArticles = await Promise.all(
        // Limit the number of articles to 10
        articles.slice(0, 15).map(async (article) => {
          if (!article.urlToImage) {
            console.warn(`No image URL for article ${article.id}`);
            return { ...article, urlToImage: "/placeholder-image.jpg" };
          }

          try {
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(
              article.urlToImage
            )}`;
            const response = await fetch(proxyUrl, {
              method: "HEAD",
            });
            if (!response.ok) {
              throw new Error(`Failed to load image: ${response.statusText}`);
            }
            return article;
          } catch (error) {
            console.warn(
              `Error loading image for article ${article.id}:`,
              error instanceof Error ? error.message : String(error)
            );
            return { ...article, urlToImage: "/placeholder-image.jpg" };
          }
        })
      );
      setLimitedArticles(validatedArticles);
    };

    fetchAndValidateImages();
  }, [articles]);

  return (
    <main className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <NavBar />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-12 text-center">
          Latest News
        </h1>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {limitedArticles.map((article, index) => (
            <Link key={article.id} href={article.url} className="block">
              <ArticleCard
                id={article.id}
                title={article.title}
                summary={article.description}
                link={article.url}
                urlToImage={article.urlToImage}
                category={article.category}
                priority={index < 3} // Prioritize loading for the first 3 images
              />
            </Link>
          ))}
        </div>
        <section className="mt-16 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Featured Categories
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {["Politics", "Technology", "Science", "Entertainment"].map(
              (category) => (
                <div
                  key={category}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {category}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Explore the latest news and updates in{" "}
                    {category.toLowerCase()}.
                  </p>
                  <Link
                    href={`/categories/${category.toLowerCase()}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View articles &rarr;
                  </Link>
                </div>
              )
            )}
          </div>
        </section>
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Stay Informed
          </h2>
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <p className="text-gray-600 mb-4 text-center">
              Subscribe to our newsletter for daily updates and breaking news.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
