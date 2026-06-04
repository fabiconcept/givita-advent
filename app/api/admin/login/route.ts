import { NextRequest, NextResponse } from 'next/server';
import { login, setSessionCookie } from '@/lib/auth';
import { checkRateLimit, loginLimiter } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const { allowed, remaining } = checkRateLimit(loginLimiter, request);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again later.' },
        {
          status: 429,
          headers: { 'X-RateLimit-Remaining': String(remaining) },
        }
      );
    }

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const result = await login(password);
    if (!result.success || !result.token) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    setSessionCookie(response, result.token);
    return response;
  } catch (error) {
    console.error('[v0] Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
