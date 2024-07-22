import ArticleCard from "@/Components/articleCard";
import Link from "next/link";
import NavBar from "@/Components/navBar";

async function getArticle(id: string): Promise<Article | undefined> {
  // In a real application, this would be an API call
  // For now, we'll return mock data based on the id
  const articles: Article[] = [
    {
      id: 1,
      title: "Breaking News: Major Scientific Discovery",
      content:
        "Scientists have made a groundbreaking discovery that could revolutionize our understanding of the universe. The discovery, made by a team of researchers at a leading university, involves a new particle that challenges our current models of physics. This finding could have far-reaching implications for our understanding of dark matter, quantum mechanics, and the origins of the universe. Experts in the field are calling it one of the most significant scientific breakthroughs of the century.",
    },
    {
      id: 2,
      title: "Tech Giant Announces New Product Line",
      content:
        "A leading tech company has unveiled its latest range of innovative products, set to hit the market next month. The new line includes cutting-edge smartphones, tablets, and wearable devices that promise to redefine user experience and connectivity. Key features include advanced AI capabilities, improved battery life, and sustainable manufacturing processes. Industry analysts predict these products will significantly impact the tech landscape and consumer behavior in the coming years.",
    },
    {
      id: 3,
      title: "Global Climate Summit Reaches Historic Agreement",
      content:
        "World leaders have come to a consensus on ambitious climate goals during the latest international summit. The agreement, which involves over 190 countries, sets unprecedented targets for reducing greenhouse gas emissions and transitioning to renewable energy sources. Key points include a commitment to achieve carbon neutrality by 2050, substantial increases in funding for climate adaptation in developing countries, and stricter regulations on industrial emissions. Environmental experts hail this as a crucial step towards combating climate change and preserving the planet for future generations.",
    },
  ];

  return articles.find((article) => article.id === parseInt(id));
}

interface Article {
  id: number;
  title: string;
  content: string;
}

interface ArticleParams {
  params: {
    id: string;
  };
}

export default async function Article({ params }: ArticleParams) {
  const article = await getArticle(params.id);

  if (!article) {
    return (
      <main className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Article not found
          </h1>
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-700 transition-colors duration-300"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <NavBar />
      <div className="max-w-3xl mx-auto">
        <ArticleCard
          id={article.id}
          title={article.title}
          summary={article.content}
          link={`/article/${article.id}`}
        />
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
