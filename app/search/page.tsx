import ArticleGrid from "@/components/ArticleGrid";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { getCachedSearchArticles } from "@/lib/cache";
import { logger } from "@/lib/logger";

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams.q === "string" ? searchParams.q : "";

  if (query) {
    logger.info('🔍 Search: requesting results', {
      route: '/search',
      query: query.substring(0, 100),
    }, 'PAGE');
  }

  // Fetch using cached search strategy (relevancy sorting)
  const startTime = Date.now();
  const articles = query ? await getCachedSearchArticles(query) : [];
  const fetchDuration = Date.now() - startTime;

  if (query) {
    logger.info('🔍 Search: results received', {
      route: '/search',
      query: query.substring(0, 100),
      resultCount: articles.length,
      duration: fetchDuration,
      cacheStatus: fetchDuration < 50 ? 'likely-hit' : 'likely-miss',
    }, 'PAGE');
  }

  // Articles are already sorted by relevancy and score
  const sortedArticles = articles;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Search Results
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {query
              ? `Found ${articles.length} results for "${query}"`
              : "Please enter a search term"}
          </p>
          {query && articles.length > 0 && (
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
              Sorted by relevancy and quality score
            </p>
          )}
        </div>

        {sortedArticles.length > 0 ? (
          <ArticleGrid
            initialArticles={sortedArticles}
          />
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 dark:text-slate-400 text-lg">No articles found matching your query.</p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
