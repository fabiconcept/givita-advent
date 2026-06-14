import { NextRequest, NextResponse } from 'next/server';
import { getForm, updateForm, deleteForm, getResponseCount } from '@/lib/formStore';
import { requireAdmin, isAdminSession, verifyPassword, hashPassword } from '@/lib/auth';
import { checkRateLimit, apiLimiter, publicLimiter, passwordLimiter } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';
import { Form } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { allowed, remaining } = checkRateLimit(publicLimiter, request);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
      );
    }

    const { id } = await params;
    const form = await getForm(id);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (!form.isPublished && !isAdminSession(request)) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const serverNow = new Date().toISOString();
    const isAdmin = isAdminSession(request);

    // Password check (skip for admins)
    if (form.passwordHash && form.passwordSalt && !isAdmin) {
      const providedPassword = request.headers.get('x-form-password');
      if (!providedPassword) {
        return NextResponse.json(
          { passwordRequired: true, isPasswordProtected: true, serverNow },
          { status: 200 }
        );
      }
      // Rate limit password attempts
      const pwAllowed = checkRateLimit(passwordLimiter, request);
      if (!pwAllowed.allowed) {
        return NextResponse.json(
          { error: 'Too many password attempts. Please try again later.' },
          { status: 429 }
        );
      }
      const valid = verifyPassword(providedPassword, form.passwordHash, form.passwordSalt);
      if (!valid) {
        return NextResponse.json(
          { error: 'Incorrect password.' },
          { status: 401 }
        );
      }
    }

    // Expiry check (skip for admins)
    if (form.expiresAt && !isAdmin) {
      const expiresAt = new Date(form.expiresAt);
      if (expiresAt.getTime() <= Date.now()) {
        return NextResponse.json(
          { reason: 'expired', error: 'This form has expired.', serverNow },
          { status: 410 }
        );
      }
    }

    // Max responses check (skip for admins)
    if (form.maxResponses && form.maxResponses > 0 && !isAdmin) {
      const count = await getResponseCount(id);
      if (count >= form.maxResponses) {
        return NextResponse.json(
          { reason: 'max_responses', error: 'This form has reached its response limit.', serverNow },
          { status: 410 }
        );
      }
    }

    // Strip sensitive fields from response
    const { passwordHash, passwordSalt, ...safeForm } = form;
    return NextResponse.json({ ...safeForm, isPasswordProtected: !!form.passwordHash, serverNow });
  } catch (error) {
    console.error('[v0] Error fetching form:', error);
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const body = (await request.json()) as Partial<Form> & { password?: string };
    const updates: Partial<Form> = {};
    if (typeof body.title === 'string') updates.title = body.title;
    if (typeof body.description === 'string') updates.description = body.description;
    if (typeof body.isPublished === 'boolean') updates.isPublished = body.isPublished;

    // Password: hash before storing, or clear if empty/null
    if (body.password !== undefined) {
      if (body.password === '' || body.password === null) {
        updates.passwordHash = undefined;
        updates.passwordSalt = undefined;
      } else if (typeof body.password === 'string' && body.password.length > 0) {
        const { hash, salt } = hashPassword(body.password);
        updates.passwordHash = hash;
        updates.passwordSalt = salt;
      }
    }

    // Expiry
    if (body.expiresAt !== undefined) {
      updates.expiresAt = body.expiresAt || undefined;
    }

    // Max responses
    if (body.maxResponses !== undefined) {
      const val = typeof body.maxResponses === 'number' ? body.maxResponses : undefined;
      updates.maxResponses = val && val > 0 ? val : undefined;
    }

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
          minLength: q?.minLength !== undefined && q?.minLength !== null ? Number(q.minLength) : undefined,
          maxLength: q?.maxLength !== undefined && q?.maxLength !== null ? Number(q.maxLength) : undefined,
          pattern: q?.pattern || undefined,
          patternMessage: q?.patternMessage || undefined,
          order: typeof q?.order === 'number' ? q.order : idx + 1,
        }))
        .sort((a, b) => a.order - b.order);
    }
    const updated = await updateForm(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    const { passwordHash: _ph, passwordSalt: _ps, ...safeUpdated } = updated;
    logger.info('admin', `PATCH /api/forms/${id} — form updated (${updates.isPublished !== undefined ? 'publish toggle' : 'content change'})`);
    return NextResponse.json({ ...safeUpdated, isPasswordProtected: !!updated.passwordHash });
  } catch (error) {
    logger.error('admin', `PATCH /api/forms/${id} — error: ${error instanceof Error ? error.message : 'unknown'}`);
    console.error('[v0] Error updating form:', error);
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const ok = await deleteForm(id);
    if (!ok) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    logger.info('admin', `DELETE /api/forms/${id} — form deleted`);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('admin', `DELETE /api/forms/${id} — error: ${error instanceof Error ? error.message : 'unknown'}`);
    console.error('[v0] Error deleting form:', error);
    const msg = error instanceof Error ? error.message : 'Failed to delete form';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
