const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const envPath = path.join(__dirname, '..', '.env.local');
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}
const root = path.resolve(__dirname, '..');
const sheetId = process.env.GOOGLE_SHEET_ID;
const credentials = JSON.parse(fs.readFileSync(path.join(root, process.env.GOOGLE_APPLICATION_CREDENTIALS), 'utf8'));
const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth });

(async () => {
  const TAB = 'Forms';

  // Check current state
  const before = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `${TAB}!A1:G` });
  console.log('Before:');
  for (const [i, row] of before.data.values.entries()) console.log(`  r${i + 1}: ${row.join(' | ').slice(0, 80)}`);

  // Append three rows in sequence with explicit insertDataOption
  for (let i = 0; i < 3; i++) {
    const id = `dtest-${Date.now()}-${i}`;
    const values = [[id, `Title ${i}`, `Desc ${i}`, 'true', new Date().toISOString(), new Date().toISOString(), `{}`]];
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${TAB}!A1:G1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });
    const updatedRange = res.data.updates?.updatedRange;
    console.log(`Append ${i} (id=${id}) → updatedRange=${updatedRange}`);
  }

  // Re-read
  const after = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `${TAB}!A1:G` });
  console.log('\nAfter:');
  for (const [i, row] of after.data.values.entries()) console.log(`  r${i + 1}: ${row.join(' | ').slice(0, 80)}`);

  // Cleanup - delete all the dtest rows
  const rows = after.data.values || [];
  for (let i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] && rows[i][0].startsWith('dtest-')) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: { requests: [{ deleteDimension: { range: { sheetId: (await sheets.spreadsheets.get({ spreadsheetId: sheetId })).data.sheets.find(s => s.properties.title === TAB).properties.sheetId, dimension: 'ROWS', startIndex: i, endIndex: i + 1 } } }] },
      });
      console.log(`  deleted r${i + 1} (${rows[i][0]})`);
    }
  }
})();
