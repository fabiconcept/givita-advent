import { NextRequest, NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/auth';
import { checkRateLimit, publicLimiter } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { allowed } = checkRateLimit(publicLimiter, request);
  if (!allowed) {
    return NextResponse.json({ isAdmin: false });
  }
  return NextResponse.json({ isAdmin: isAdminSession(request) });
}
