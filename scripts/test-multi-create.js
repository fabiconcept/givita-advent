const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2];
  }
}

const BASE = 'http://localhost:3000';

async function api(method, url, body) {
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

function assert(cond, msg) {
  if (!cond) { console.error('  FAIL:', msg); process.exit(1); }
  else { console.log('  OK:', msg); }
}

async function main() {
  await api('POST', '/api/admin/login', { password: process.env.ADMIN_PASSWORD || 'admin123' });

  console.log('[1] Baseline: count existing forms');
  const base = await api('GET', '/api/forms');
  const baseCount = base.data.forms.length;
  console.log(`  baseline count: ${baseCount}`);

  console.log('\n[2] Create 3 forms in sequence with unique IDs');
  const ids = [];
  for (let i = 0; i < 3; i++) {
    const id = `multitest-${Date.now()}-${i}`;
    ids.push(id);
    const res = await api('POST', '/api/forms', {
      id,
      title: `Multi Test Form ${i + 1}`,
      description: `Form number ${i + 1}`,
      isPublished: true,
      questions: [{ id: 'q1', title: `Q1 of form ${i + 1}`, type: 'text', required: false, order: 1 }],
    });
    console.log(`  POST ${id} → ${res.status}`);
    if (res.status !== 201) {
      console.error('  resp:', JSON.stringify(res.data));
      process.exit(1);
    }
  }

  console.log('\n[3] List forms - count should have grown by 3');
  const after = await api('GET', '/api/forms');
  const afterCount = after.data.forms.length;
  console.log(`  after count: ${afterCount} (delta: ${afterCount - baseCount})`);
  assert(afterCount - baseCount === 3, 'three new forms exist');

  console.log('\n[4] Each new form must be retrievable individually');
  for (const id of ids) {
    const res = await api('GET', `/api/forms/${id}`);
    assert(res.status === 200, `GET /api/forms/${id} returns 200`);
    assert(res.data.title && res.data.title.startsWith('Multi Test'), `title persisted for ${id}`);
    assert(res.data.questions.length === 1, `question persisted for ${id}`);
  }

  console.log('\n[5] Slug-collision: create two forms with the same slugified id');
  const collisionId = `collision-${Date.now()}`;
  const first = await api('POST', '/api/forms', {
    id: collisionId,
    title: 'First Title',
    isPublished: true,
    questions: [],
  });
  console.log(`  first → ${first.status}`);
  const second = await api('POST', '/api/forms', {
    id: collisionId,
    title: 'Second Title',
    isPublished: true,
    questions: [],
  });
  console.log(`  second → ${second.status}`);
  assert(second.status === 409, 'second create with same id returns 409');

  console.log('\n[6] Cleanup');
  for (const id of ids) await api('DELETE', `/api/forms/${id}`);
  await api('DELETE', `/api/forms/${collisionId}`);
  const final = await api('GET', '/api/forms');
  console.log(`  final count: ${final.data.forms.length} (should equal baseline ${baseCount})`);
  assert(final.data.forms.length === baseCount, 'cleanup restored baseline');

  console.log('\nAll checks passed.');
}

main().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
