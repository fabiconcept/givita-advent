import { NextRequest, NextResponse } from 'next/server';
import { appendRow, isSheetsAvailable } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
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
