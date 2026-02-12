/**
 * Category Configuration System
 *
 * Defines all 6 news categories with smart categorization rules,
 * preferred sources, and category-specific search queries.
 */

export interface CategoryConfig {
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: string;

  // Smart categorization rules
  preferredSources: string[];  // Domains to prioritize for this category
  keywords: {
    strong: string[];   // High-confidence indicators (+2 points each)
    weak: string[];     // Supporting signals (+1 point each)
    exclude: string[];  // Negative indicators (-5 points each)
  };
  queries: string[];    // Category-specific search queries
}

export const CATEGORIES: CategoryConfig[] = [
  {
    slug: 'politics',
    name: 'Politics',
    description: 'Latest political news, elections, legislation, and policy updates',
    color: 'bg-blue-500',
    icon: '🏛️',
    preferredSources: [
      'politico.com',
      'thehill.com',
      'reuters.com',
      'apnews.com',
      'washingtonpost.com',
      'nytimes.com',
      'theguardian.com',
      'bbc.com',
      'cnn.com',
      'nbcnews.com'
    ],
    keywords: {
      strong: [
        'election',
        'congress',
        'senate',
        'president',
        'legislation',
        'political',
        'vote',
        'campaign',
        'parliament',
        'government',
        'politician',
        'democracy',
        'republican',
        'democrat',
        'policy',
        'white house',
        'capitol'
      ],
      weak: [
        'law',
        'bill',
        'committee',
        'hearing',
        'debate',
        'governor',
        'mayor',
        'representative',
        'senator'
      ],
      exclude: [
        'sports',
        'entertainment',
        'movie',
        'music',
        'game',
        'celebrity',
        'album',
        'concert'
      ]
    },
    queries: [
      'politics OR election OR congress OR senate',
      'legislation OR policy OR government',
      'president OR white house OR capitol'
    ]
  },

  {
    slug: 'technology',
    name: 'Technology',
    description: 'Tech news, software updates, startups, AI, and innovation',
    color: 'bg-purple-500',
    icon: '💻',
    preferredSources: [
      'techcrunch.com',
      'theverge.com',
      'arstechnica.com',
      'wired.com',
      'engadget.com',
      'cnet.com',
      'zdnet.com',
      'techradar.com',
      'venturebeat.com',
      'mashable.com'
    ],
    keywords: {
      strong: [
        'technology',
        'tech',
        'software',
        'ai',
        'artificial intelligence',
        'startup',
        'app',
        'platform',
        'digital',
        'cyber',
        'data',
        'algorithm',
        'coding',
        'programming',
        'developer',
        'innovation',
        'gadget',
        'device',
        'smartphone',
        'computer'
      ],
      weak: [
        'online',
        'internet',
        'web',
        'cloud',
        'network',
        'silicon valley',
        'tech company',
        'launch',
        'update',
        'beta'
      ],
      exclude: [
        'sports',
        'music',
        'political campaign',
        'entertainment industry',
        'movie production'
      ]
    },
    queries: [
      'technology OR software OR AI OR "artificial intelligence"',
      'startup OR innovation OR tech company',
      'app OR platform OR digital OR gadget'
    ]
  },

  {
    slug: 'science',
    name: 'Science',
    description: 'Scientific discoveries, research, space, climate, and nature',
    color: 'bg-green-500',
    icon: '🔬',
    preferredSources: [
      'nature.com',
      'scientificamerican.com',
      'newscientist.com',
      'science.org',
      'smithsonianmag.com',
      'nationalgeographic.com',
      'theverge.com',
      'arstechnica.com',
      'bbc.com',
      'theguardian.com'
    ],
    keywords: {
      strong: [
        'science',
        'scientific',
        'research',
        'study',
        'discovery',
        'experiment',
        'scientist',
        'climate',
        'environment',
        'space',
        'nasa',
        'astronomy',
        'physics',
        'chemistry',
        'biology',
        'ecology',
        'renewable',
        'fossil',
        'ocean',
        'species'
      ],
      weak: [
        'laboratory',
        'journal',
        'published',
        'findings',
        'breakthrough',
        'innovation',
        'planet',
        'ecosystem',
        'conservation',
        'energy'
      ],
      exclude: [
        'sports science',
        'political science',
        'entertainment',
        'music',
        'celebrity'
      ]
    },
    queries: [
      'science OR research OR discovery OR study',
      'climate OR environment OR renewable',
      'space OR NASA OR astronomy OR planet'
    ]
  },

  {
    slug: 'entertainment',
    name: 'Entertainment',
    description: 'Movies, music, TV shows, celebrities, and pop culture',
    color: 'bg-pink-500',
    icon: '🎬',
    preferredSources: [
      'variety.com',
      'hollywoodreporter.com',
      'billboard.com',
      'rollingstone.com',
      'mashable.com',
      'usatoday.com',
      'cnn.com',
      'bbc.com',
      'theguardian.com'
    ],
    keywords: {
      strong: [
        'entertainment',
        'movie',
        'film',
        'actor',
        'actress',
        'celebrity',
        'music',
        'album',
        'song',
        'concert',
        'tour',
        'artist',
        'band',
        'musician',
        'singer',
        'hollywood',
        'tv show',
        'series',
        'streaming',
        'netflix',
        'disney'
      ],
      weak: [
        'premiere',
        'release',
        'trailer',
        'box office',
        'award',
        'grammy',
        'oscar',
        'emmy',
        'performance',
        'director',
        'producer'
      ],
      exclude: [
        'political',
        'election',
        'congress',
        'legislation',
        'sports team',
        'medical'
      ]
    },
    queries: [
      'entertainment OR movie OR film OR hollywood',
      'music OR album OR concert OR artist',
      'tv OR streaming OR netflix OR series'
    ]
  },

  {
    slug: 'sports',
    name: 'Sports',
    description: 'Sports news, games, athletes, and competitions',
    color: 'bg-orange-500',
    icon: '⚽',
    preferredSources: [
      'espn.com',
      'si.com',
      'bleacherreport.com',
      'usatoday.com',
      'bbc.com',
      'theguardian.com',
      'cnn.com',
      'nbcnews.com'
    ],
    keywords: {
      strong: [
        'sports',
        'game',
        'team',
        'player',
        'athlete',
        'football',
        'basketball',
        'baseball',
        'soccer',
        'nfl',
        'nba',
        'mlb',
        'nhl',
        'championship',
        'tournament',
        'league',
        'coach',
        'win',
        'loss',
        'score'
      ],
      weak: [
        'match',
        'competition',
        'playoff',
        'season',
        'draft',
        'trade',
        'contract',
        'injury',
        'record',
        'olympic'
      ],
      exclude: [
        'political',
        'movie',
        'music',
        'entertainment industry',
        'technology company',
        'scientific'
      ]
    },
    queries: [
      'sports OR game OR championship OR tournament',
      'nfl OR nba OR mlb OR soccer',
      'athlete OR player OR team OR coach'
    ]
  },

  {
    slug: 'health',
    name: 'Health',
    description: 'Health news, medical research, wellness, and healthcare',
    color: 'bg-red-500',
    icon: '🏥',
    preferredSources: [
      'healthline.com',
      'webmd.com',
      'medicalnewstoday.com',
      'nature.com',
      'scientificamerican.com',
      'reuters.com',
      'apnews.com',
      'cnn.com',
      'bbc.com',
      'theguardian.com'
    ],
    keywords: {
      strong: [
        'health',
        'medical',
        'medicine',
        'doctor',
        'hospital',
        'patient',
        'disease',
        'treatment',
        'drug',
        'vaccine',
        'pandemic',
        'virus',
        'cancer',
        'wellness',
        'healthcare',
        'diagnosis',
        'therapy',
        'clinical',
        'fda',
        'cdc'
      ],
      weak: [
        'symptom',
        'prescription',
        'pharmaceutical',
        'nutrition',
        'diet',
        'fitness',
        'mental health',
        'surgeon',
        'emergency'
      ],
      exclude: [
        'sports health',
        'political health',
        'entertainment',
        'music',
        'movie'
      ]
    },
    queries: [
      'health OR medical OR healthcare OR medicine',
      'disease OR treatment OR vaccine OR drug',
      'wellness OR mental health OR nutrition'
    ]
  }
];

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORIES.find(cat => cat.slug === slug);
}

/**
 * Get category by name
 */
export function getCategoryByName(name: string): CategoryConfig | undefined {
  return CATEGORIES.find(cat => cat.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get all category slugs (useful for static generation)
 */
export function getAllCategorySlugs(): string[] {
  return CATEGORIES.map(cat => cat.slug);
}
