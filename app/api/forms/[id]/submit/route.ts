import { NextRequest, NextResponse } from 'next/server';
import { getForm, addResponse } from '@/lib/formStore';
import { isAdminSession } from '@/lib/auth';
import { checkRateLimit, publicLimiter } from '@/lib/rateLimit';
import { validateQuestion } from '@/lib/validation';
import { FormResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    const form = await getForm(id);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (!form.isPublished && !isAdminSession(request)) {
      return NextResponse.json({ error: 'This form is not accepting responses' }, { status: 403 });
    }

    const errors: Record<string, string> = {};
    for (const question of form.questions) {
      const value = body.responses?.[question.id];
      const err = validateQuestion(question, value);
      if (err) errors[question.id] = err;
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
    }

    const response: FormResponse = {
      id: `response-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      formId: id,
      responses: body.responses || {},
      submittedAt: new Date().toISOString(),
    };

    await addResponse(id, response);

    return NextResponse.json(
      {
        success: true,
        message: 'Response recorded successfully',
        responseId: response.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Form submission error:', error);
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }
}
