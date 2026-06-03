#!/usr/bin/env node
/* eslint-disable no-console */
// Verifies the Google Sheets connection using the project env + credentials.

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env.local');

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const sheetId = process.env.GOOGLE_SHEET_ID;
const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const inlineCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (!sheetId) {
  console.error('FAIL: GOOGLE_SHEET_ID is not set in .env.local');
  process.exit(1);
}

let credentials = null;
if (inlineCreds) {
  try { credentials = JSON.parse(inlineCreds); }
  catch (err) { console.error('FAIL: GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON:', err.message); process.exit(1); }
} else if (credsPath) {
  const abs = path.isAbsolute(credsPath) ? credsPath : path.join(root, credsPath);
  if (!fs.existsSync(abs)) {
    console.error(`FAIL: credentials file not found at ${abs}`);
    process.exit(1);
  }
  try { credentials = JSON.parse(fs.readFileSync(abs, 'utf8')); }
  catch (err) { console.error(`FAIL: credentials file at ${abs} is not valid JSON:`, err.message); process.exit(1); }
} else {
  console.error('FAIL: neither GOOGLE_APPLICATION_CREDENTIALS nor GOOGLE_APPLICATION_CREDENTIALS_JSON is set');
  process.exit(1);
}

(async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId, includeGridData: false });
    const title = meta.data.properties?.title || sheetId;
    const tabs = (meta.data.sheets || []).map((s) => s.properties?.title);
    console.log('OK: connected to spreadsheet');
    console.log('  title :', title);
    console.log('  id    :', sheetId);
    console.log('  tabs  :', tabs.length === 0 ? '(none — sheet is empty)' : tabs.join(', '));

    const required = ['Forms', 'Responses'];
    const missing = required.filter((t) => !tabs.includes(t));
    if (missing.length) {
      console.log(`\nNOTE: missing tabs: ${missing.join(', ')}`);
      console.log('  the app will create them on first write.');
    }
  } catch (err) {
    const code = err?.code || err?.response?.status;
    const msg = err?.message || String(err);
    console.error(`FAIL: sheets API error (code ${code ?? '?'}): ${msg}`);
    if (code === 404) console.error('  → check GOOGLE_SHEET_ID is correct and the sheet exists.');
    if (code === 403) console.error('  → share the sheet with the service account email as Editor.');
    process.exit(1);
  }
})();
