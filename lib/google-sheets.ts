import { google, sheets_v4 } from 'googleapis';
import type { JWT } from 'google-auth-library';

export type SheetRow = Record<string, string | number | boolean | null | undefined>;

const CACHE_TTL_MS = 30_000;

interface CacheEntry {
  rows: SheetRow[];
  headers: string[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function isSheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEET_ID &&
      (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS)
  );
}

function parseServiceAccountKey(): Record<string, unknown> | null {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('[google-sheets] Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:', err);
    return null;
  }
}

let sheetsClient: sheets_v4.Sheets | null = null;

export function getSheetsClient(): sheets_v4.Sheets | null {
  if (!isSheetsConfigured()) return null;
  if (sheetsClient) return sheetsClient;

  const auth = new google.auth.GoogleAuth({
    credentials: parseServiceAccountKey() ?? undefined,
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
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
    return { headers: cached.headers, rows: cached.rows };
  }

  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  if (!sheets || !spreadsheetId) {
    return { headers: [], rows: [] };
  }

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: fullRange(tabName),
    });
    const values = res.data.values || [];
    if (values.length === 0) {
      cache.set(tabName, { headers: [], rows: [], expiresAt: Date.now() + CACHE_TTL_MS });
      return { headers: [], rows: [] };
    }
    const headers = (values[0] as string[]).map((h) => h.trim().toLowerCase());
    const rows: SheetRow[] = values.slice(1).map((rawRow) => {
      const row: SheetRow = {};
      headers.forEach((h, i) => {
        row[h] = ((rawRow as string[])[i] ?? '').toString();
      });
      return row;
    });
    cache.set(tabName, { headers, rows, expiresAt: Date.now() + CACHE_TTL_MS });
    return { headers, rows };
  } catch (err) {
    // Any error reading the tab (missing tab, invalid range, permission
    // boundary) is treated as "no data" so callers can still try to create
    // the tab. We swallow and log.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[google-sheets] readRows(${tabName}) returned empty:`, err instanceof Error ? err.message : err);
    }
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
  const effectiveHeaders = ensured.headers;
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

  const lower = lowerData(data);
  const ordered = headers.map((h) => {
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
