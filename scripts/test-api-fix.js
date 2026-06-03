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
  if (!cond) {
    console.error('  FAIL:', msg);
    process.exit(1);
  } else {
    console.log('  OK:', msg);
  }
}

async function login() {
  const res = await api('POST', '/api/admin/login', { password: process.env.ADMIN_PASSWORD || 'admin123' });
  // Cookies are not preserved across calls in this script. We just need the dev
  // server to be reachable. PATCH/DELETE below don't require auth in the
  // current implementation.
  return res;
}

async function main() {
  await login();

  console.log('[1] Create new form via POST /api/forms');
  const id = `apitest-${Date.now()}`;
  const created = await api('POST', '/api/forms', {
    id,
    title: 'API Test Form',
    description: 'Verifying sheet write of all fields',
    isPublished: true,
    questions: [
      { id: 'q1', title: 'Q1', type: 'text', required: true, order: 1 },
      { id: 'q2', title: 'Q2', type: 'multiple-choice', required: false, options: ['A', 'B'], order: 2 },
    ],
  });
  console.log(`  status: ${created.status}`);
  assert(created.status === 201, 'create returns 201');
  assert(created.data.questions.length === 2, '2 questions echoed back');
  assert(created.data.isPublished === true, 'isPublished echoed back as true');

  console.log('\n[2] GET /api/forms/[id] - read back');
  const fetched = await api('GET', `/api/forms/${id}`);
  assert(fetched.status === 200, 'GET returns 200');
  assert(fetched.data.title === 'API Test Form', 'title persisted');
  assert(fetched.data.questions.length === 2, 'questions persisted (2)');
  assert(fetched.data.questions[0].id === 'q1', 'question 1 id persisted');
  assert(fetched.data.questions[1].options && fetched.data.questions[1].options.length === 2, 'options persisted');
  assert(fetched.data.isPublished === true, 'isPublished persisted as true');
  assert(typeof fetched.data.createdAt === 'string' && fetched.data.createdAt.length > 10, 'createdAt persisted');

  console.log('\n[3] PATCH /api/forms/[id] - add a question');
  const patched = await api('PATCH', `/api/forms/${id}`, {
    questions: [
      ...created.data.questions,
      { id: 'q3', title: 'Q3 email', type: 'email', required: false, order: 3 },
    ],
  });
  assert(patched.status === 200, 'PATCH returns 200');
  assert(patched.data.questions.length === 3, 'PATCH added question (3 total)');

  const refetched = await api('GET', `/api/forms/${id}`);
  assert(refetched.data.questions.length === 3, 'GET after PATCH has 3 questions (persistence check)');

  console.log('\n[4] PATCH /api/forms/[id] - toggle publish off then on');
  const off = await api('PATCH', `/api/forms/${id}`, { isPublished: false });
  assert(off.data.isPublished === false, 'unpublish persisted');
  const on = await api('PATCH', `/api/forms/${id}`, { isPublished: true });
  assert(on.data.isPublished === true, 're-publish persisted');

  console.log('\n[5] POST /api/forms/[id]/submit - submit a response');
  const submit = await api('POST', `/api/forms/${id}/submit`, {
    responses: { q1: 'hello', q2: 'A' },
  });
  assert(submit.status === 200 || submit.status === 201, 'submit succeeds');

  console.log('\n[6] GET /api/forms/[id]/responses?stats=true');
  const stats = await api('GET', `/api/forms/${id}/responses?stats=true`);
  assert(stats.status === 200, 'stats returns 200');
  assert(stats.data.totalResponses >= 1, 'at least 1 response recorded');
  assert(stats.data.stats.q1 && stats.data.stats.q1.count >= 1, 'q1 has a response');

  console.log('\n[7] GET /api/forms - list shows the new form');
  const list = await api('GET', '/api/forms');
  const found = list.data.forms.find((f) => f.id === id);
  assert(Boolean(found), 'form appears in list');
  assert(found.questions.length === 3, 'listed form has 3 questions');

  console.log('\n[8] DELETE /api/forms/[id] - cleanup');
  const del = await api('DELETE', `/api/forms/${id}`);
  assert(del.status === 200, 'delete returns 200');
  const gone = await api('GET', `/api/forms/${id}`);
  assert(gone.status === 404, 'form is gone (404)');

  console.log('\nAll checks passed.');
}

main().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
