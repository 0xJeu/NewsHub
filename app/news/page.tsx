import ArticleGrid from "@/components/ArticleGrid";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { fetchArticles } from "@/lib/api";
import { buildRotatingQuery } from "@/lib/config/queries";

export default async function NewsPage() {
  const homepageQuery = buildRotatingQuery();
  const articles = await fetchArticles("homepage", { homepageQuery });
  
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
