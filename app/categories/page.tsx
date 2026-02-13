import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import CategoryCardsGrid from "@/components/CategoryCardsGrid";

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <NavBar />
      <div className="flex-grow max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">
            Browse by Category
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Discover stories that matter to you. Select a category below to explore curated news and in-depth articles.
          </p>
        </div>
        
        <CategoryCardsGrid variant="categories" />
      </div>
      <Footer />
    </main>
  );
}
