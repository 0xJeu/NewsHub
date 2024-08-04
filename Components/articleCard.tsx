import React, { useState } from "react";
import Image from "next/image";

interface ArticleCardProps {
  id: number;
  title: string;
  summary: string;
  urlToImage: string;
  priority?: boolean;
  category: string;
  link: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  id,
  title,
  summary,
  urlToImage,
  priority,
  category,
}) => {
  const [imageSrc, setImageSrc] = useState(urlToImage);
  const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageSrc)}`;

  const handleImageError = () => {
    console.warn(`Image load failed for article ${id}: ${urlToImage}`);
    setImageSrc("/placeholder-image.jpg");
  };

  return (
    <article className="bg-white shadow-lg rounded-xl overflow-hidden transition-transform duration-300 hover:scale-105 flex flex-col h-full">
      <div className="relative w-full h-48">
        <Image
          src={proxyUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          className="rounded-t-xl"
          onError={handleImageError}
          priority={priority}
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-xl font-bold text-gray-800 mb-3 break-words">
          {title}
        </h2>
        <div className="w-full h-0.5 bg-gray-200 mb-4"></div>
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-4 flex-grow">
          {summary}
        </p>
        <div className="mt-4">
          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {category}
          </span>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
