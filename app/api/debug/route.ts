import { NextResponse } from 'next/server';
import { isSheetsAvailable, getSheetsClient, readRows } from '@/lib/google-sheets';
import { getAllForms } from '@/lib/formStore';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  logger.info('debug', 'GET /api/debug — starting diagnostics');

  const env: Record<string, string | null> = {
    NODE_ENV: process.env.NODE_ENV ?? null,
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ? `set (${process.env.GOOGLE_SHEET_ID.length} chars)` : null,
    GOOGLE_APPLICATION_CREDENTIALS_JSON: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
      ? `set (${process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON.length} chars)`
      : null,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS ?? null,
    DEBUG_LOG: process.env.DEBUG_LOG ?? null,
  };
  logger.debug('debug', 'Environment:', env);

  let jsonParseOk = false;
  let jsonParseError: string | null = null;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      const p = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      jsonParseOk = true;
      jsonParseError = `email: ${p.client_email}`;
      logger.debug('debug', `JSON parse OK: ${p.client_email}`);
    } catch (e: unknown) {
      jsonParseError = e instanceof Error ? e.message : String(e);
      logger.error('debug', `JSON parse failed: ${jsonParseError}`);
    }
  }

  const sheetsAvailable = isSheetsAvailable();
  logger.info('debug', `isSheetsAvailable: ${sheetsAvailable}`);

  let forms: unknown[] | string = 'not checked';
  let sheetsError: string | null = null;
  if (sheetsAvailable) {
    try {
      const client = getSheetsClient();
      if (client) {
        logger.debug('debug', 'Reading Forms tab...');
        const { rows } = await readRows('Forms');
        forms = rows.filter((r) => r.id && r.id !== '').map((r) => ({
          id: r.id,
          title: r.title,
          isFeatured: r.isfeatured,
        }));
        logger.info('debug', `Sheets returned ${rows.length} rows, ${(forms as unknown[]).length} with IDs`);
      } else {
        forms = 'client is null';
        logger.error('debug', 'getSheetsClient returned null');
      }
    } catch (e: unknown) {
      sheetsError = e instanceof Error ? e.message : String(e);
      logger.error('debug', `Sheets error: ${sheetsError}`);
    }
  } else {
    forms = 'sheets not configured (isSheetsAvailable=false)';
    logger.warn('debug', 'Sheets not configured — will check memory fallback');
  }

  let memoryForms: unknown[] = [];
  try {
    memoryForms = await getAllForms();
    logger.info('debug', `getAllForms() returned ${memoryForms.length} forms`);
    for (const f of memoryForms) {
      const rec = f as Record<string, unknown>;
      logger.debug('debug', `  form id=${rec.id} title=${rec.title} isFeatured=${rec.isFeatured}`);
    }
  } catch (e: unknown) {
    logger.error('debug', `getAllForms() threw: ${e instanceof Error ? e.message : String(e)}`);
  }

  const hasFeatured = memoryForms.some((f: unknown) => (f as Record<string, unknown>).isFeatured);
  logger.info('debug', `hasFeatured: ${hasFeatured}`);

  return NextResponse.json({
    env,
    jsonParse: { ok: jsonParseOk, detail: jsonParseError },
    sheetsAvailable,
    sheetsError,
    formsFromSheets: forms,
    formsTotal: memoryForms.length,
    hasFeatured,
  });
}
