import { ArticleScore } from '@/lib/scoring/article-scorer';
import { SourceConfig } from '@/lib/config/sources';
import { CategoryConfig } from '@/lib/config/categories';

export interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  category: string;
  score?: number;  // Overall quality score (0-100)
  sourceName?: string;  // Display name of the source
}

export interface RawArticle {
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source?: {
    id?: string;
    name?: string;
  };
  content?: string;
  author?: string;
}

export interface ScoredArticle extends RawArticle {
  score: ArticleScore;
  sourceConfig?: SourceConfig;
}

export type FetchStrategy = 'homepage' | 'category' | 'search';

export interface FetchOptions {
  searchQuery?: string;
  homepageQuery?: string;
  category?: CategoryConfig;
  page?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
}

export interface FetchConfig {
  query: string;
  domains?: string;
  sortBy: 'relevancy' | 'popularity' | 'publishedAt';
  from?: string;
  to?: string;
  pageSize: number;
  page?: number;
  language?: string;
}
