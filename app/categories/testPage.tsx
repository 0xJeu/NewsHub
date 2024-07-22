import React from "react";
import Link from "next/link";
import NavBar from "@/Components/navBar";
import Footer from "@/Components/footer";

interface Category {
  name: string;
  description: string;
  slug: string;
}

const categories: Category[] = [
  {
    name: "Politics",
    description:
      "Stay informed about the latest political developments and policy changes.",
    slug: "politics",
  },
  {
    name: "Technology",
    description: "Explore cutting-edge innovations and tech industry news.",
    slug: "technology",
  },
  {
    name: "Science",
    description:
      "Discover groundbreaking research and scientific advancements.",
    slug: "science",
  },
  {
    name: "Entertainment",
    description: "Get the latest updates on movies, music, and celebrity news.",
    slug: "entertainment",
  },
  {
    name: "Sports",
    description:
      "Follow your favorite teams and athletes with up-to-date sports coverage.",
    slug: "sports",
  },
  {
    name: "Health",
    description:
      "Learn about medical breakthroughs and health tips for a better lifestyle.",
    slug: "health",
  },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300">
      <NavBar />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
          News Categories
        </h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.slug}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                {category.name}
              </h2>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <Link
                href={`/categories/${category.slug}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View articles &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
