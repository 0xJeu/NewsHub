/**
 * Smart Query Construction System
 *
 * Replaces generic keyword searches (e.g., "google OR apple")
 * with queries focused on interesting news signals and events.
 */

export interface QueryStrategy {
  name: string;
  weight: number;  // Percentage weight in query rotation
  queries: string[];
}

export const QUERY_STRATEGIES = {
  // High-impact events (60% weight) - Major newsworthy happenings
  majorEvents: {
    name: 'Major Events',
    weight: 60,
    queries: [
      'announces OR announced OR unveils OR unveiled',
      'launches OR launched OR releases OR released',
      'acquisition OR merger OR bought OR acquires',
      'funding OR investment OR raised OR investors',
      'breakthrough OR discovery OR discovered',
      'controversy OR scandal OR investigation',
      'lawsuit OR sues OR sued OR legal action',
      'crisis OR emergency OR outbreak',
      'historic OR unprecedented OR landmark',
      'breaking OR developing OR urgent'
    ]
  },

  // Trending topics (25% weight) - Current hot topics
  trending: {
    name: 'Trending Topics',
    weight: 25,
    queries: [
      'AI OR "artificial intelligence" OR ChatGPT OR OpenAI OR machine learning',
      'climate OR "climate change" OR renewable OR sustainability',
      'election OR political OR congress OR senate OR campaign',
      'cryptocurrency OR bitcoin OR blockchain OR crypto',
      'covid OR pandemic OR vaccine OR health crisis',
      'space OR NASA OR SpaceX OR mars OR asteroid',
      'ukraine OR russia OR conflict OR war',
      'economy OR inflation OR recession OR market crash'
    ]
  },

  // Discovery & Innovation (15% weight) - New developments
  discovery: {
    name: 'Discovery & Innovation',
    weight: 15,
    queries: [
      'startup OR innovation OR revolutionary OR groundbreaking',
      'study OR research OR scientist OR scientists',
      'policy OR regulation OR legislation OR law',
      'prototype OR experimental OR testing OR trial',
      'record-breaking OR fastest OR biggest OR first-ever',
      'unveils OR reveals OR debuts OR introduces'
    ]
  }
};

/**
 * Select a random query from a strategy's query list
 */
function selectRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Build a rotating query that combines multiple strategies
 * This is called for homepage fetching to get diverse, interesting content
 */
export function buildRotatingQuery(): string {
  const strategies = Object.values(QUERY_STRATEGIES);

  // Weighted random selection based on strategy weights
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const strategy of strategies) {
    cumulative += strategy.weight;
    if (roll <= cumulative) {
      return selectRandom(strategy.queries);
    }
  }

  // Fallback: combine major events + trending
  const major = selectRandom(QUERY_STRATEGIES.majorEvents.queries);
  const trend = selectRandom(QUERY_STRATEGIES.trending.queries);
  return `(${major}) OR (${trend})`;
}

/**
 * Build a comprehensive query that covers all interesting signals
 * Used for broad searches when you want maximum coverage
 */
export function buildComprehensiveQuery(): string {
  const allQueries: string[] = [];

  // Get top queries from each strategy
  allQueries.push(selectRandom(QUERY_STRATEGIES.majorEvents.queries));
  allQueries.push(selectRandom(QUERY_STRATEGIES.trending.queries));
  allQueries.push(selectRandom(QUERY_STRATEGIES.discovery.queries));

  return allQueries.map(q => `(${q})`).join(' OR ');
}

/**
 * Build a query focused on major events only
 * Good for "breaking news" or "top stories" sections
 */
export function buildMajorEventsQuery(): string {
  // Combine multiple major event queries for broader coverage
  const queries = [
    selectRandom(QUERY_STRATEGIES.majorEvents.queries),
    selectRandom(QUERY_STRATEGIES.majorEvents.queries)
  ];

  return queries.map(q => `(${q})`).join(' OR ');
}

/**
 * Build a query for a specific trending topic
 */
export function buildTrendingQuery(): string {
  return selectRandom(QUERY_STRATEGIES.trending.queries);
}

/**
 * Get time-based date filters for NewsAPI
 */
export function getLast3Days(): string {
  const date = new Date();
  date.setDate(date.getDate() - 3);
  return date.toISOString();
}

export function getLast7Days(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString();
}

export function getLast30Days(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
}

export function getLastHours(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}
