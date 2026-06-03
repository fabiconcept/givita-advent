#!/usr/bin/env node
/* eslint-disable no-console */
// Dumps the current contents of Forms + Responses tabs for sanity-checking.

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env.local');
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq < 0) continue;
  let v = t.slice(eq + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  if (process.env[t.slice(0, eq).trim()] === undefined) process.env[t.slice(0, eq).trim()] = v;
}

const sheetId = process.env.GOOGLE_SHEET_ID;
const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const credentials = JSON.parse(fs.readFileSync(path.isAbsolute(credsPath) ? credsPath : path.join(root, credsPath), 'utf8'));
const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth });

(async () => {
  for (const tab of ['Forms', 'Responses']) {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `${tab}!A1:Z` });
    const values = res.data.values || [];
    console.log(`\n=== ${tab} (${values.length} rows) ===`);
    if (values.length === 0) { console.log('  (empty)'); continue; }
    console.log('  header :', values[0].join(' | '));
    values.slice(1).forEach((row, i) => {
      const cells = row.map((c) => (c.length > 60 ? c.slice(0, 57) + '...' : c));
      console.log(`  r${i + 2}    :`, cells.join(' | '));
    });
  }
})();
