import { NextRequest, NextResponse } from 'next/server';
import { getForm, addResponse, getResponseCount } from '@/lib/formStore';
import { isAdminSession, verifyPassword } from '@/lib/auth';
import { checkRateLimit, publicLimiter, passwordLimiter } from '@/lib/rateLimit';
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

    // Password check (skip for admins)
    if (form.passwordHash && form.passwordSalt && !isAdminSession(request)) {
      const providedPassword = request.headers.get('x-form-password');
      if (!providedPassword) {
        return NextResponse.json({ error: 'Password required.' }, { status: 401 });
      }
      const pwAllowed = checkRateLimit(passwordLimiter, request);
      if (!pwAllowed.allowed) {
        return NextResponse.json({ error: 'Too many password attempts.' }, { status: 429 });
      }
      const valid = verifyPassword(providedPassword, form.passwordHash, form.passwordSalt);
      if (!valid) {
        return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
      }
    }

    // Expiry check
    if (form.expiresAt) {
      const expiresAt = new Date(form.expiresAt);
      if (expiresAt.getTime() <= Date.now()) {
        return NextResponse.json({ error: 'This form has expired.', reason: 'expired' }, { status: 410 });
      }
    }

    // Max responses check
    if (form.maxResponses && form.maxResponses > 0) {
      const count = await getResponseCount(id);
      if (count >= form.maxResponses) {
        return NextResponse.json({ error: 'This form has reached its response limit.', reason: 'max_responses' }, { status: 410 });
      }
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
