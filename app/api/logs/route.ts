import { NextRequest, NextResponse } from 'next/server';
import { getLogs, logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const DISABLED_VALUES = new Set(['', 'off', 'false', '0', 'silent', 'none']);

export async function GET(request: NextRequest) {
  const raw = process.env.DEBUG_LOG;
  if (!raw || raw === undefined || raw === null || DISABLED_VALUES.has(raw.trim())) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '200', 10) || 200, 1), 500);
  const level = url.searchParams.get('level');
  const tag = url.searchParams.get('tag');

  let logs = getLogs(limit);
  if (level) logs = logs.filter((l) => l.level === level);
  if (tag) logs = logs.filter((l) => l.tag === tag);

  logger.info('logs', `GET /api/logs — returned ${logs.length} entries (buffer: ${getLogs(500).length})`);
  return NextResponse.json({ logs, total: getLogs(500).length, returned: logs.length });
}
