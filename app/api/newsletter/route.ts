import { NextRequest, NextResponse } from 'next/server';
import { appendRow, isSheetsAvailable } from '@/lib/google-sheets';
import { checkRateLimit, publicLimiter } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { allowed, remaining } = checkRateLimit(publicLimiter, request);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: { 'X-RateLimit-Remaining': String(remaining) },
        }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (isSheetsAvailable()) {
      await appendRow('Newsletter', {
        email,
        subscribedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { success: true, message: 'You\'re on the list. Welcome to the community.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[newsletter] Subscription error:', error);
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
