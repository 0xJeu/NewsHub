import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  // Check for a secret token to prevent unauthorized revalidation
  // You should add REVALIDATE_TOKEN to your environment variables
  const secret = process.env.REVALIDATE_TOKEN || "my-secret-token";

  if (token !== secret) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  revalidateTag('articles');
  
  return NextResponse.json({ 
    revalidated: true, 
    now: Date.now(),
    message: 'Cache flushed for articles' 
  });
}
