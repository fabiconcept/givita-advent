import { NextResponse } from 'next/server';
import { isSheetsAvailable, getSheetsClient, readRows } from '@/lib/google-sheets';
import { getAllForms } from '@/lib/formStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env: Record<string, string | null> = {
    NODE_ENV: process.env.NODE_ENV ?? null,
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ? `set (${process.env.GOOGLE_SHEET_ID.length} chars)` : null,
    GOOGLE_APPLICATION_CREDENTIALS_JSON: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
      ? `set (${process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON.length} chars)`
      : null,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS ?? null,
  };

  let jsonParseOk = false;
  let jsonParseError: string | null = null;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      const p = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      jsonParseOk = true;
      jsonParseError = `email: ${p.client_email}`;
    } catch (e: unknown) {
      jsonParseError = e instanceof Error ? e.message : String(e);
    }
  }

  const sheetsAvailable = isSheetsAvailable();

  let forms: unknown[] | string = 'not checked';
  let sheetsError: string | null = null;
  if (sheetsAvailable) {
    try {
      const client = getSheetsClient();
      if (client) {
        const { rows } = await readRows('Forms');
        forms = rows.filter((r) => r.id && r.id !== '').map((r) => ({
          id: r.id,
          title: r.title,
          isFeatured: r.isfeatured,
        }));
      } else {
        forms = 'client is null';
      }
    } catch (e: unknown) {
      sheetsError = e instanceof Error ? e.message : String(e);
    }
  } else {
    forms = 'sheets not configured (isSheetsAvailable=false)';
  }

  // also check in-memory fallback
  let memoryForms: unknown[] = [];
  try {
    memoryForms = await getAllForms();
  } catch { /* ignore */ }

  return NextResponse.json({
    env,
    jsonParse: { ok: jsonParseOk, detail: jsonParseError },
    sheetsAvailable,
    sheetsError,
    formsFromSheets: forms,
    formsTotal: memoryForms.length,
    hasFeatured: memoryForms.some((f: unknown) => (f as Record<string, unknown>).isFeatured),
  });
}
