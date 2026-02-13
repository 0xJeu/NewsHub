import { NextResponse } from 'next/server';
import { getCurrentUsage, getUsageByStrategy } from '@/lib/monitoring/api-tracker';
import { CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const usage = getCurrentUsage();
  const byStrategy = getUsageByStrategy();

  return NextResponse.json({
    cache: {
      type: 'unstable_cache (Vercel Data Cache)',
      ttl: {
        homepage: `${CACHE_TTL.homepage}s (${CACHE_TTL.homepage / 60} min)`,
        category: `${CACHE_TTL.category}s (${CACHE_TTL.category / 60} min)`,
        search: `${CACHE_TTL.search}s (${CACHE_TTL.search / 60} min)`,
      },
      invalidation: {
        all: '/api/revalidate?token=<REVALIDATE_TOKEN>',
        perCategory: '/api/revalidate?token=<REVALIDATE_TOKEN>&category=<slug>',
        tags: ['articles', 'category-{slug}', 'search'],
      },
    },
    apiUsage: {
      date: usage.date,
      callsToday: usage.count,
      remaining: usage.remaining,
      limit: usage.limit,
      percentUsed: usage.percentage,
      byStrategy,
    },
    observability: {
      tip: 'Check Vercel Function Logs for "CACHE MISS" entries. No log = cache hit.',
      note: 'API usage counter is per-instance (resets on cold start). Use Vercel Logs for the full picture.',
    },
  });
}
