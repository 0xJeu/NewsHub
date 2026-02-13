"use client";

import React, { useState } from "react";
import ArticleCard from "@/components/articleCard";
import { loadMoreArticles } from "@/app/actions";
import Link from "next/link";
import { Article } from "@/types";

export default function ArticleGrid({ initialArticles }: { initialArticles: Article[] }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [page, setPage] = useState(2); // Start fetching from page 2 (page 1 is initial)
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const newArticles = await loadMoreArticles(page);
      
      if (newArticles.length === 0) {
        setHasMore(false);
      } else {
        setArticles((prev) => [...prev, ...newArticles]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to load more articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {articles.map((article, index) => (
          <Link key={`${article.id}-${index}`} href={article.url} className="block h-full">
            <ArticleCard
              id={article.id}
              title={article.title}
              summary={article.description}
              link={article.url}
              urlToImage={article.urlToImage}
              category={article.category}
              publishedAt={article.publishedAt}
              priority={index < 3}
              score={article.score}
              sourceName={article.sourceName}
            />
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mb-20">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-slate-500 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              "Load More News"
            )}
          </button>
        </div>
      )}
    </>
  );
}
