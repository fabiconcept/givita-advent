import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return NextResponse.json({ isAdmin: isAdminSession(request as never) });
}
