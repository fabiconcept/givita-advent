import { NextRequest, NextResponse } from 'next/server';
import { getForm, updateForm, deleteForm } from '@/lib/formStore';
import { requireAdmin } from '@/lib/auth';
import { checkRateLimit, apiLimiter } from '@/lib/rateLimit';
import { Form } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const form = await getForm(id);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    return NextResponse.json(form);
  } catch (error) {
    console.error('[v0] Error fetching form:', error);
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
  }
}

export async function PATCH(
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
    const body = (await request.json()) as Partial<Form>;
    const updates: Partial<Form> = {};
    if (typeof body.title === 'string') updates.title = body.title;
    if (typeof body.description === 'string') updates.description = body.description;
    if (typeof body.isPublished === 'boolean') updates.isPublished = body.isPublished;
    if (Array.isArray(body.questions)) {
      updates.questions = body.questions
        .map((q, idx) => ({
          id: (q?.id || `q${idx + 1}`).toString(),
          title: (q?.title || '').toString().trim() || `Question ${idx + 1}`,
          type: q?.type || 'text',
          required: Boolean(q?.required),
          options: Array.isArray(q?.options) ? q?.options.map((o) => String(o)) : undefined,
          minLabel: q?.minLabel || undefined,
          maxLabel: q?.maxLabel || undefined,
          maxScore: q?.maxScore ? Number(q.maxScore) : undefined,
          description: q?.description || undefined,
          placeholder: q?.placeholder || undefined,
          min: q?.min !== undefined && q?.min !== null ? Number(q.min) : undefined,
          max: q?.max !== undefined && q?.max !== null ? Number(q.max) : undefined,
          unit: q?.unit || undefined,
          order: typeof q?.order === 'number' ? q.order : idx + 1,
        }))
        .sort((a, b) => a.order - b.order);
    }
    const updated = await updateForm(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[v0] Error updating form:', error);
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
}

export async function DELETE(
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
    const ok = await deleteForm(id);
    if (!ok) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting form:', error);
    const msg = error instanceof Error ? error.message : 'Failed to delete form';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
