import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let token = request.nextUrl.searchParams.get('token');
  const secret = process.env.REVALIDATE_TOKEN || "my-secret-token";

  // Handle case where '=' is encoded as '%3D'
  if (!token) {
    for (const key of request.nextUrl.searchParams.keys()) {
      if (key === `token=${secret}`) {
        token = secret;
        break;
      }
    }
  }

  logger.info('Cache revalidation request received', {
    tokenProvided: !!token,
    url: request.url
  }, 'REVALIDATE');

  if (token !== secret) {
    logger.warn('Unauthorized cache revalidation attempt', {
      tokenProvided: !!token,
      url: request.url
    }, 'REVALIDATE');
    return NextResponse.json({ message: 'Invalid token', received: token, expected: 'REVALIDATE_TOKEN' }, { status: 401 });
  }

  try {
    const startTime = Date.now();
    const category = request.nextUrl.searchParams.get('category');
    const tagsInvalidated: string[] = [];

    if (category) {
      // Invalidate a specific category only
      revalidateTag(`category-${category}`);
      revalidatePath(`/categories/${category}`);
      tagsInvalidated.push(`category-${category}`);
    } else {
      // Invalidate everything
      revalidateTag('articles');
      revalidatePath('/');
      tagsInvalidated.push('articles');
    }

    const duration = Date.now() - startTime;

    logger.info('Cache successfully revalidated', {
      tags: tagsInvalidated,
      category: category || 'all',
      duration,
      timestamp: new Date().toISOString()
    }, 'REVALIDATE');

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      tags: tagsInvalidated,
      message: category
        ? `Cache flushed for category: ${category}`
        : 'Cache flushed for all articles',
    });
  } catch (err) {
    logger.error('Cache revalidation failed', err, {
      tags: ['articles'],
      paths: ['/']
    }, 'REVALIDATE');
    return NextResponse.json({ message: 'Error revalidating', error: String(err) }, { status: 500 });
  }
}
