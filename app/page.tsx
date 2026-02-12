import ArticleCard from "@/components/articleCard";
import ArticleGrid from "@/components/ArticleGrid";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/navBar";
import Footer from "@/components/footer";
import { fetchArticles } from "@/lib/api";
import { getPlaceholderForSeed } from "@/lib/placeholders";

export default async function Home() {
  // Fetch articles using 'homepage' strategy (trending + recent, scored and ranked)
  const articles = await fetchArticles('homepage');

  // Articles are already sorted by score (highest first)
  // Hero article: highest-scored article
  const heroArticle = articles[0];

  // Grid articles: next 12 highest-scored
  const initialGridArticles = articles.slice(1, 13);

  return (
    <main className="min-h-screen bg-slate-50">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        {heroArticle && (
          <section className="mb-16">
            <Link href={heroArticle.url} className="group block relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="relative h-[500px] w-full">
                <Image
                  src={
                    heroArticle.urlToImage ||
                    getPlaceholderForSeed(
                      `${heroArticle.url}|${heroArticle.title}|${heroArticle.publishedAt}`
                    )
                  }
                  alt={heroArticle.title}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                  className="transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-4xl">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-block px-4 py-1.5 text-sm font-semibold tracking-wide text-white bg-primary-600 rounded-full">
                      {heroArticle.category}
                    </span>
                    {heroArticle.score && heroArticle.score >= 80 && (
                      <span className="inline-block px-4 py-1.5 text-sm font-semibold tracking-wide text-white bg-orange-500 rounded-full">
                        🔥 Trending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                     <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                     <span className="text-sm font-bold text-slate-300">
                       {new Date(heroArticle.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                     </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-primary-200 transition-colors">
                    {heroArticle.title}
                  </h1>
                  <p className="text-lg text-slate-200 line-clamp-2 max-w-2xl">
                    {heroArticle.description}
                  </p>
                </div>
              </div>
            </Link>
          </section>
        )}

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Latest News</h2>
          <Link href="/news" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center">
            View all <span className="ml-1">→</span>
          </Link>
        </div>

        <ArticleGrid initialArticles={initialGridArticles} />

        {/* Categories Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Explore Categories</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Dive deep into specific topics that matter to you. From technology breakthroughs to global politics.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Politics", slug: "politics", icon: "🏛️", color: "bg-blue-50 text-blue-700 border-blue-100" },
              { name: "Technology", slug: "technology", icon: "💻", color: "bg-purple-50 text-purple-700 border-purple-100" },
              { name: "Science", slug: "science", icon: "🔬", color: "bg-green-50 text-green-700 border-green-100" },
              { name: "Entertainment", slug: "entertainment", icon: "🎬", color: "bg-pink-50 text-pink-700 border-pink-100" },
              { name: "Sports", slug: "sports", icon: "⚽", color: "bg-orange-50 text-orange-700 border-orange-100" },
              { name: "Health", slug: "health", icon: "🏥", color: "bg-red-50 text-red-700 border-red-100" }
            ].map((category) => (
              <Link
                key={category.name}
                href={`/categories/${category.slug}`}
                className={`group p-8 rounded-2xl border ${category.color} hover:shadow-md transition-all duration-300 text-center`}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                <span className="text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                  Browse Articles →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="mb-20">
          <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
              </svg>
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Stay Ahead of the Curve
              </h2>
              <p className="text-slate-300 mb-8 text-lg">
                Get the latest breaking news and in-depth analysis delivered directly to your inbox every morning.
              </p>
              
              <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-grow px-6 py-3.5 rounded-full text-slate-900 bg-white border-2 border-transparent focus:outline-none focus:border-primary-500 focus:ring-0"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-primary-500 transition-colors shadow-lg shadow-primary-900/20"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
