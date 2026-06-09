import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, clearSessionCookie } from '@/lib/auth';
import { checkRateLimit, apiLimiter } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { allowed, remaining } = checkRateLimit(apiLimiter, request);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        {
          status: 429,
          headers: { 'X-RateLimit-Remaining': String(remaining) },
        }
      );
    }

    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error('[v0] Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
