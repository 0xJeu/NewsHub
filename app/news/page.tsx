import ArticleGrid from "@/components/ArticleGrid";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { getCachedHomepageArticles } from "@/lib/cache";
import { buildRotatingQuery } from "@/lib/config/queries";
import { logger } from "@/lib/logger";

export default async function NewsPage() {
  const homepageQuery = buildRotatingQuery();

  logger.info('📰 All News: requesting articles', {
    route: '/news',
    query: homepageQuery.substring(0, 50),
  }, 'PAGE');

  const startTime = Date.now();
  const articles = await getCachedHomepageArticles(homepageQuery);
  const fetchDuration = Date.now() - startTime;

  logger.info('📰 All News: articles received', {
    route: '/news',
    articleCount: articles.length,
    duration: fetchDuration,
    cacheStatus: fetchDuration < 50 ? 'likely-hit' : 'likely-miss',
  }, 'PAGE');
  
  // Ensure articles are sorted by publishedAt (descending)
  const sortedArticles = articles.sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">All News</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Stay updated with the latest stories from around the world.
          </p>
        </div>

        <ArticleGrid
          initialArticles={sortedArticles}
        />
      </div>

      <Footer />
    </main>
  );
}
