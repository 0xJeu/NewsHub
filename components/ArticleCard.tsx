"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  defaultPlaceholderImage,
  getNextPlaceholder,
  getPlaceholderForSeed,
  isPlaceholderImage,
  placeholderImages,
} from "@/lib/placeholders";

interface ArticleCardProps {
  id: number;
  title: string;
  summary: string;
  urlToImage: string;
  publishedAt: string;
  priority?: boolean;
  category: string;
  link: string;
  score?: number;
  sourceName?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  id,
  title,
  summary,
  urlToImage,
  publishedAt,
  priority,
  category,
  score,
  sourceName,
}) => {
  const fallbackCountRef = useRef(0);
  const fallbackSeed = `${id}|${title}|${publishedAt}`;
  const [imageSrc, setImageSrc] = useState(
    urlToImage || getPlaceholderForSeed(fallbackSeed)
  );

  const handleImageError = () => {
    setImageSrc((currentSrc) => {
      if (fallbackCountRef.current >= placeholderImages.length) {
        return defaultPlaceholderImage;
      }

      const nextSrc = getNextPlaceholder(currentSrc, fallbackSeed);
      fallbackCountRef.current += 1;

      if (nextSrc === currentSrc && isPlaceholderImage(currentSrc)) {
        return defaultPlaceholderImage;
      }

      return nextSrc;
    });
  };

  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full">
      <div className="relative w-full h-52 overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          className="transition-transform duration-500 group-hover:scale-105"
          onError={handleImageError}
          priority={priority}
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide text-primary-700 dark:text-primary-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-sm">
            {category}
          </span>
          {score && score >= 80 && (
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide text-white bg-orange-500/90 backdrop-blur-sm rounded-full shadow-sm">
              🔥 Trending
            </span>
          )}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
           <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
           </svg>
           <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
             {formattedDate}
           </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 flex-grow">
          {summary}
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {sourceName && (
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {sourceName}
              </span>
            )}
            {!sourceName && (
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Read more
              </span>
            )}
          </div>
          <svg className="w-4 h-4 text-primary-500 dark:text-primary-400 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
