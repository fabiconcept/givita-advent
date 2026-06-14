import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomUUID, createHash, randomBytes } from 'crypto';

const COOKIE_NAME = 'admin_session';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SIGNING_KEY = process.env.SIGNING_KEY || createHash('sha256').update(ADMIN_PASSWORD).digest('hex');

function sign(payload: string): string {
  return createHmac('sha256', SIGNING_KEY).update(payload).digest('hex');
}

function makeToken(): string {
  const payload = `admin:${Date.now()}:${randomUUID()}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string): { ok: boolean; role: string | null } {
  const idx = token.lastIndexOf('.');
  if (idx === -1) return { ok: false, role: null };
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return { ok: false, role: null };
    return { ok: a.equals(b), role: payload.split(':')[0] };
  } catch {
    return { ok: false, role: null };
  }
}

export function login(password: string): { success: boolean; token?: string } {
  if (password !== ADMIN_PASSWORD) return { success: false };
  return { success: true, token: makeToken() };
}

export function isAdminSession(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const { ok, role } = verifyToken(token);
  return ok && role === 'admin';
}

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const { ok, role } = verifyToken(token);
    return ok && role === 'admin';
  } catch {
    return false;
  }
}

export function requireAdmin(request: NextRequest): NextResponse | null {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !verifyToken(token).ok) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  return null;
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(COOKIE_NAME);
}

// ----- Form password hashing (SHA-256 + salt) -----

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(salt + password)
    .digest('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const hash = createHash('sha256')
    .update(salt + password)
    .digest('hex');
  // Constant-time comparison
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a[i] ^ b[i];
  return result === 0;
}
