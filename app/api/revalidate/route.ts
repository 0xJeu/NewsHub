import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  // Check for a secret token to prevent unauthorized revalidation
  // You should add REVALIDATE_TOKEN to your environment variables
  const secret = process.env.REVALIDATE_TOKEN || "my-secret-token";

  if (token !== secret) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  try {
    revalidateTag('articles');
    revalidatePath('/');
    console.log('Cache flushed for articles and home path at ' + new Date().toISOString());
    
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      message: 'Cache flushed for articles and home path' 
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating', error: String(err) }, { status: 500 });
  }
}
