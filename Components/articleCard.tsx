import React from "react";
import Link from "next/link";
import Image from "next/image";

interface ArticleCardProps {
  id: number;
  title: string;
  summary: string;
  link: string;
  imageUrl: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  id,
  title,
  summary,
  imageUrl,
}) => {
  return (
    <article
      key={id}
      className="bg-white shadow-lg rounded-xl overflow-hidden transition-transform duration-300 hover:scale-105"
    >
      <div className="relative w-full h-48">
        <Image
          src={imageUrl}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="rounded-t-xl"
        />
      </div>
      <div className="p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>
        <div className="w-full h-1 bg-gray-200 mb-6"></div>
        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
          {summary}
        </p>
      </div>
    </article>
  );
};

export default ArticleCard;
