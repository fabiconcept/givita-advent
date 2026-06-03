import { NextRequest } from 'next/server';

const COOKIE_NAME = 'admin_session';

export const ADMIN_COOKIE = COOKIE_NAME;

export function isAdminSession(request: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD || 'admin123';
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  return Boolean(cookie && cookie === expected);
}
