import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

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

  console.log(`Revalidate request - Token received: '${token}'`);

  if (token !== secret) {
    return NextResponse.json({ message: 'Invalid token', received: token, expected: 'REVALIDATE_TOKEN' }, { status: 401 });
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
