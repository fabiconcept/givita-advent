import { NextRequest, NextResponse } from 'next/server';
import { getAllForms, createForm } from '@/lib/formStore';
import { isSheetsAvailable } from '@/lib/google-sheets';
import { requireAdmin } from '@/lib/auth';
import { checkRateLimit, apiLimiter } from '@/lib/rateLimit';
import { Form, FormQuestion } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { allowed, remaining } = checkRateLimit(apiLimiter, request);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
      );
    }

    const forms = await getAllForms();
    return NextResponse.json({
      forms,
      source: isSheetsAvailable() ? 'sheets' : 'memory',
    });
  } catch (error) {
    console.error('[v0] Error fetching forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}

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

    const body = (await request.json()) as Partial<Form>;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid form body' }, { status: 400 });
    }

    const id = (body.id || '').toString().trim() || `form-${Date.now()}`;
    const title = (body.title || '').toString().trim();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const description = (body.description || '').toString();
    const isPublished = body.isPublished !== false;
    const now = new Date().toISOString();
    const rawQuestions = Array.isArray(body.questions) ? body.questions : [];
    const questions: FormQuestion[] = rawQuestions
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
        order: typeof q?.order === 'number' ? q.order : idx + 1,
      }))
      .sort((a, b) => a.order - b.order);

    const form: Form = {
      id,
      title,
      description,
      isPublished,
      createdAt: now,
      updatedAt: now,
      questions,
    };

    const created = await createForm(form);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating form:', error);
    const message = error instanceof Error ? error.message : 'Failed to create form';
    const status = message.toLowerCase().includes('already exists') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
