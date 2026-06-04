import { NextRequest, NextResponse } from 'next/server';
import { getResponses, getResponseStats, getForm } from '@/lib/formStore';
import { requireAdmin } from '@/lib/auth';
import { checkRateLimit, apiLimiter } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const stats = searchParams.get('stats') === 'true';

    const form = await getForm(id);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (stats) {
      const statsData = await getResponseStats(id);
      return NextResponse.json(statsData);
    }

    const responses = await getResponses(id);
    return NextResponse.json({
      formId: id,
      count: responses.length,
      responses,
    });
  } catch (error) {
    console.error('[v0] Error fetching responses:', error);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}
