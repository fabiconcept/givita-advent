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
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  for (const tab of ['Forms', 'Responses']) {
    const sheet = meta.data.sheets.find(s => s.properties.title === tab);
    if (!sheet) continue;
    const sheetIdNum = sheet.properties.sheetId;
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `${tab}!A1:A` });
    const values = res.data.values || [];
    const toDelete = [];
    for (let i = 1; i < values.length; i++) {
      const id = values[i][0] || '';
      if (id.startsWith('dtest-') || id.startsWith('apitest-') || id.startsWith('multitest-') || id.startsWith('test-fix-') || id.startsWith('collision-')) {
        toDelete.push({ index: i, id });
      }
    }
    if (toDelete.length === 0) {
      console.log(`${tab}: nothing to clean`);
      continue;
    }
    // delete in reverse order so indices stay valid
    for (const { index, id } of [...toDelete].reverse()) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: { requests: [{ deleteDimension: { range: { sheetId: sheetIdNum, dimension: 'ROWS', startIndex: index, endIndex: index + 1 } } }] },
      });
      console.log(`${tab}: deleted row ${index + 1} (${id})`);
    }
  }
})();
