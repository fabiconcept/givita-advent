import { google, sheets_v4 } from 'googleapis';
import type { JWT } from 'google-auth-library';
import { logger } from '@/lib/logger';

export type SheetRow = Record<string, string | number | boolean | null | undefined>;

const CACHE_TTL_MS = 30_000;

interface CacheEntry {
  rows: SheetRow[];
  headers: string[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function isSheetsConfigured() {
  const isProd = process.env.NODE_ENV === 'production';
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const prodCred = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const devCred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const result = Boolean(sheetId && (isProd ? prodCred : devCred));
  logger.debug('sheets', `isSheetsConfigured: NODE_ENV=${isProd ? 'prod' : 'dev'} sheetId=${!!sheetId} credential=${isProd ? `json(${prodCred?.length ?? 0}chars)` : `file(${devCred ?? 'unset'})`} → ${result}`);
  return result;
}

function parseServiceAccountKey(): Record<string, unknown> | null {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    logger.debug('sheets', `parseServiceAccountKey OK — email: ${parsed.client_email}`);
    return parsed;
  } catch (err) {
    const firstFew = raw.slice(0, 80);
    logger.error('sheets', `Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON (first 80 chars: ${firstFew}...):`, err);
    return null;
  }
}

let sheetsClient: sheets_v4.Sheets | null = null;

export function getSheetsClient(): sheets_v4.Sheets | null {
  if (!isSheetsConfigured()) {
    logger.debug('sheets', 'getSheetsClient: not configured — returning null');
    return null;
  }
  if (sheetsClient) {
    logger.debug('sheets', 'getSheetsClient: returning cached client');
    return sheetsClient;
  }

  const isProd = process.env.NODE_ENV === 'production';
  logger.debug('sheets', `getSheetsClient: creating new client (${isProd ? 'prod' : 'dev'})`);

  let auth;
  try {
    auth = new google.auth.GoogleAuth({
      credentials: isProd ? parseServiceAccountKey() ?? undefined : undefined,
      keyFile: isProd ? undefined : process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    logger.debug('sheets', 'GoogleAuth created successfully');
  } catch (err) {
    logger.error('sheets', 'Failed to create GoogleAuth:', err);
    return null;
  }

  sheetsClient = google.sheets({ version: 'v4', auth });
  logger.debug('sheets', 'Sheets client created');
  return sheetsClient;
}

export function getSpreadsheetId(): string | null {
  return process.env.GOOGLE_SHEET_ID || null;
}

function escapeSheetName(name: string) {
  if (/^[A-Za-z0-9_]+$/.test(name)) return name;
  return `'${name.replace(/'/g, "''")}'`;
}

function a1Range(tabName: string, row: number) {
  return `${escapeSheetName(tabName)}!A${row}:Z${row}`;
}

function fullRange(tabName: string) {
  return `${escapeSheetName(tabName)}!A1:Z`;
}

function isSheetsError(err: unknown): err is { code: number; message: string } {
  return Boolean(
    err &&
      typeof err === 'object' &&
      'code' in (err as Record<string, unknown>) &&
      'message' in (err as Record<string, unknown>)
  );
}

export function isSheetsAvailable() {
  return isSheetsConfigured();
}

export async function readRows(tabName: string, opts: { skipCache?: boolean } = {}): Promise<{
  headers: string[];
  rows: SheetRow[];
}> {
  const cached = cache.get(tabName);
  if (!opts.skipCache && cached && cached.expiresAt > Date.now()) {
    logger.debug('sheets', `readRows(${tabName}) cache hit — ${cached.rows.length} rows`);
    return { headers: cached.headers, rows: cached.rows };
  }

  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  if (!sheets || !spreadsheetId) {
    logger.warn('sheets', `readRows(${tabName}): sheets=${!!sheets} spreadsheetId=${!!spreadsheetId} → returning empty`);
    return { headers: [], rows: [] };
  }

  try {
    logger.debug('sheets', `readRows(${tabName}): fetching from API`);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: fullRange(tabName),
    });
    const values = res.data.values || [];
    logger.debug('sheets', `readRows(${tabName}): API returned ${values.length} rows`);
    if (values.length === 0) {
      cache.set(tabName, { headers: [], rows: [], expiresAt: Date.now() + CACHE_TTL_MS });
      return { headers: [], rows: [] };
    }
    const headers = (values[0] as string[]).map((h) => h.trim().toLowerCase());
    logger.debug('sheets', `readRows(${tabName}): headers=[${headers.join(',')}]`);
    const rows: SheetRow[] = values.slice(1).map((rawRow) => {
      const row: SheetRow = {};
      headers.forEach((h, i) => {
        row[h] = ((rawRow as string[])[i] ?? '').toString();
      });
      return row;
    });
    cache.set(tabName, { headers, rows, expiresAt: Date.now() + CACHE_TTL_MS });
    logger.debug('sheets', `readRows(${tabName}): ${rows.length} data rows cached`);
    return { headers, rows };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('sheets', `readRows(${tabName}) API error: ${msg}`);
    cache.set(tabName, { headers: [], rows: [], expiresAt: Date.now() + CACHE_TTL_MS });
    return { headers: [], rows: [] };
  }
}

function lowerData(data: SheetRow): Record<string, string | number | boolean | null | undefined> {
  const out: Record<string, string | number | boolean | null | undefined> = {};
  for (const [k, v] of Object.entries(data)) {
    out[k.toLowerCase()] = v;
  }
  return out;
}

export async function appendRow(tabName: string, data: SheetRow): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  if (!sheets || !spreadsheetId) {
    throw new Error('Google Sheets is not configured. Set GOOGLE_SHEET_ID and credentials.');
  }

  const ensured = await ensureTab(tabName, Object.keys(data));
  let effectiveHeaders = ensured.headers;
  const missing = Object.keys(lowerData(data)).filter((k) => !effectiveHeaders.includes(k));
  if (missing.length > 0) {
    effectiveHeaders = await ensureColumns(tabName, data, effectiveHeaders);
  }
  const lower = lowerData(data);

  const ordered = effectiveHeaders.map((h) => {
    const v = lower[h];
    if (v === undefined || v === null) return '';
    return String(v);
  });

  // Point the append at the header row (A1:G1) so the API detects the full
  // table width; with the column-only range `A:A` the API sometimes treats
  // the table as a single column and overwrites row 2. `INSERT_ROWS` is the
  // documented default but we set it explicitly for safety.
  const lastCol = String.fromCharCode(64 + Math.max(effectiveHeaders.length, 1));
  const appendRange = `${escapeSheetName(tabName)}!A1:${lastCol}1`;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: appendRange,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [ordered] },
  });

  invalidateCache(tabName);
}

async function ensureTab(
  tabName: string,
  defaultHeaders: string[]
): Promise<{ headers: string[]; created: boolean }> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  if (!sheets || !spreadsheetId) {
    return { headers: defaultHeaders, created: false };
  }

  const { headers } = await readRows(tabName, { skipCache: true });
  if (headers.length > 0) {
    return { headers, created: false };
  }

  const exists = await tabExists(tabName);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: tabName } } }],
      },
    });
    sheetIdCache.delete(tabName);
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: fullRange(tabName),
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [defaultHeaders] },
  });

  invalidateCache(tabName);
  return { headers: defaultHeaders, created: true };
}

async function tabExists(tabName: string): Promise<boolean> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  if (!sheets || !spreadsheetId) return false;
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId, includeGridData: false });
    return (meta.data.sheets || []).some((s) => s.properties?.title === tabName);
  } catch {
    return false;
  }
}

async function ensureColumns(
  tabName: string,
  data: SheetRow,
  existingHeaders: string[],
): Promise<string[]> {
  const lower = lowerData(data);
  const newKeys = Object.keys(lower).filter((k) => !existingHeaders.includes(k));
  if (newKeys.length === 0) return existingHeaders;

  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  if (!sheets || !spreadsheetId) return existingHeaders;

  const newHeaders = [...existingHeaders, ...newKeys];
  const lastCol = String.fromCharCode(64 + newHeaders.length);
  const headerRange = `${escapeSheetName(tabName)}!A1:${lastCol}1`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: headerRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [newHeaders] },
  });

  invalidateCache(tabName);
  return newHeaders;
}

export async function updateRow(
  tabName: string,
  rowNumber: number,
  data: SheetRow
): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  if (!sheets || !spreadsheetId) {
    throw new Error('Google Sheets is not configured.');
  }

  const { headers, rows } = await readRows(tabName, { skipCache: true });
  if (headers.length === 0) {
    throw new Error(`Tab "${tabName}" has no header row; cannot update row ${rowNumber}.`);
  }
  if (rowNumber < 2 || rowNumber - 1 > rows.length) {
    throw new Error(`Row ${rowNumber} is out of range for tab "${tabName}".`);
  }

  const effectiveHeaders = await ensureColumns(tabName, data, headers);

  const lower = lowerData(data);
  const ordered = effectiveHeaders.map((h) => {
    const v = lower[h];
    if (v === undefined || v === null) return '';
    return String(v);
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: a1Range(tabName, rowNumber),
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [ordered] },
  });

  invalidateCache(tabName);
}

export async function deleteRow(tabName: string, rowNumber: number): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  if (!sheets || !spreadsheetId) {
    throw new Error('Google Sheets is not configured.');
  }

  const { rows } = await readRows(tabName, { skipCache: true });
  if (rowNumber < 2 || rowNumber - 1 > rows.length) {
    throw new Error(`Row ${rowNumber} is out of range for tab "${tabName}".`);
  }

  const sheetId = await getSheetIdForTab(tabName);
  if (sheetId === null) {
    throw new Error(`Tab "${tabName}" not found in spreadsheet.`);
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });

  invalidateCache(tabName);
}

const sheetIdCache = new Map<string, number>();

async function getSheetIdForTab(tabName: string): Promise<number | null> {
  const cached = sheetIdCache.get(tabName);
  if (cached !== undefined) return cached;
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  if (!sheets || !spreadsheetId) return null;
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId, includeGridData: false });
    const sheet = meta.data.sheets?.find((s) => s.properties?.title === tabName);
    const id = sheet?.properties?.sheetId;
    if (typeof id === 'number') {
      sheetIdCache.set(tabName, id);
      return id;
    }
    return null;
  } catch (err) {
    console.error(`[google-sheets] getSheetIdForTab(${tabName}) failed:`, err);
    return null;
  }
}

export function invalidateCache(tabName?: string) {
  if (tabName) cache.delete(tabName);
  else cache.clear();
}

// Test hook — not exported in route handlers
export const __debug = { isSheetsConfigured };

// Re-export auth type for downstream use
export type { JWT };
