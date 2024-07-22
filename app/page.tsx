import ArticleCard from "@/Components/articleCard";
import Link from "next/link";
import React from "react";
import NavBar from "@/Components/navBar";
import Footer from "@/Components/footer";

interface Article {
  id: number;
  title: string;
  summary: string;
  link: string;
}

async function getArticles(): Promise<Article[]> {
  // In a real application, this would be an API call
  // For now, we'll return mock data
  return [
    {
      id: 1,
      title: "Breaking News: Major Scientific Discovery",
      summary:
        "Scientists have made a groundbreaking discovery that could revolutionize our understanding of the universe.",
      link: "/article/1",
    },
    {
      id: 2,
      title: "Tech Giant Announces New Product Line",
      summary:
        "A leading tech company has unveiled its latest range of innovative products, set to hit the market next month.",
      link: "/article/2",
    },
    {
      id: 3,
      title: "Global Climate Summit Reaches Historic Agreement",
      summary:
        "World leaders have come to a consensus on ambitious climate goals during the latest international summit.",
      link: "/article/3",
    },
  ];
}

export default async function Home(): Promise<React.ReactElement> {
  const articles = await getArticles();

  return (
    <main className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <NavBar />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-12 text-center">
          Latest News
        </h1>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.id} href={article.link} className="block">
              <ArticleCard
                id={article.id}
                title={article.title}
                summary={article.summary}
                link={article.link}
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
