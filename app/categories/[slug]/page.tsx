import { fetchArticlesByCategory } from '@/lib/api';
import { CATEGORIES, getCategoryBySlug } from '@/lib/config/categories';
import NavBar from '@/components/navBar';
import Footer from '@/components/footer';
import ArticleGrid from '@/components/ArticleGrid';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

/**
 * Generate static params for all categories
 */
export async function generateStaticParams() {
  return CATEGORIES.map(category => ({
    slug: category.slug
  }));
}

/**
 * Generate metadata for each category page
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    return {
      title: 'Category Not Found'
    };
  }

  return {
    title: `${category.name} News - News Aggregator`,
    description: category.description
  };
}

/**
 * Category page component
 */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  // Fetch articles for this category
  const articles = await fetchArticlesByCategory(category.slug);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NavBar />

      {/* Category Header */}
      <section className="bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{category.icon}</span>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {category.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                {category.description}
              </p>
            </div>
          </div>

          {/* Category Stats */}
          <div className="mt-6 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">{articles.length}</span>
              <span>articles</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {new Set(articles.map(a => a.sourceName).filter(Boolean)).size}
              </span>
              <span>sources</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${category.color}`}></span>
              <span className="capitalize">{category.slug}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {articles.length > 0 ? (
          <ArticleGrid
            initialArticles={articles}
          />
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">{category.icon}</div>
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No articles found
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Check back later for {category.name.toLowerCase()} news.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
