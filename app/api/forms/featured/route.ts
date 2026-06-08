import { NextRequest, NextResponse } from 'next/server';
import { getAllForms, updateForm } from '@/lib/formStore';
import { requireAdmin } from '@/lib/auth';
import { checkRateLimit, apiLimiter } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  logger.debug('featured', 'GET /api/forms/featured — fetching all forms');
  const all = await getAllForms();
  logger.debug('featured', `getAllForms returned ${all.length} forms`);
  for (const f of all) {
    logger.debug('featured', `  form id=${f.id} isFeatured=${f.isFeatured}`);
  }
  const featured = all.find((f) => f.isFeatured);
  if (!featured) {
    logger.warn('featured', 'No featured form found — returning 404');
    return NextResponse.json({ form: null }, { status: 404 });
  }
  logger.info('featured', `Found featured form: id=${featured.id} title=${featured.title}`);
  return NextResponse.json({ form: featured });
}

export async function PATCH(request: NextRequest) {
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

    const { formId } = await request.json();
    if (!formId || typeof formId !== 'string') {
      return NextResponse.json({ error: 'formId required' }, { status: 400 });
    }

    const all = await getAllForms();

    const target = all.find((f) => f.id === formId);
    if (!target) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    for (const form of all) {
      const shouldBeFeatured = form.id === formId;
      if (Boolean(form.isFeatured) !== shouldBeFeatured) {
        await updateForm(form.id, { isFeatured: shouldBeFeatured });
      }
    }

    return NextResponse.json({ form: { ...target, isFeatured: true } });
  } catch (err) {
    console.error('[featured] Error:', err);
    return NextResponse.json({ error: 'Failed to set featured form' }, { status: 500 });
  }
}
