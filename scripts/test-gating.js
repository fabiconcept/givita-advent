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
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function api(method, url, body, cookie) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data, headers: res.headers };
}

function assert(cond, msg) {
  if (!cond) { console.error('  FAIL:', msg); process.exit(1); }
  else { console.log('  OK:', msg); }
}

async function main() {
  console.log('[1] 404 form: GET /api/forms/does-not-exist returns 404');
  const r1 = await api('GET', '/api/forms/does-not-exist-xyz');
  assert(r1.status === 404, '404 returned');

  console.log('\n[2] Unpublished form blocks public access');
  // Create unpublished form
  const id = `gate-${Date.now()}`;
  const created = await api('POST', '/api/forms', {
    id,
    title: 'Draft Gate Test',
    isPublished: false,
    questions: [{ id: 'q1', title: 'Q1', type: 'text', required: false, order: 1 }],
  });
  assert(created.status === 201, 'unpublished form created');
  assert(created.data.isPublished === false, 'isPublished=false');

  // Anonymous GET still returns the form data (page-level guard handles it).
  // The hard enforcement is on submit.
  const fetchAnon = await api('GET', `/api/forms/${id}`);
  assert(fetchAnon.status === 200, 'GET returns form data (page will gate)');

  // Submit blocked
  const subAnon = await api('POST', `/api/forms/${id}/submit`, { responses: { q1: 'x' } });
  assert(subAnon.status === 403, 'anon submit blocked with 403');

  // Log in as admin
  const login = await api('POST', '/api/admin/login', { password: PASSWORD });
  assert(login.status === 200, 'admin login ok');
  const setCookie = login.headers.get('set-cookie') || '';
  const cookie = setCookie.split(';')[0];
  assert(cookie.includes('admin_session='), 'admin cookie issued');

  // Submit allowed for admin
  const subAdmin = await api('POST', `/api/forms/${id}/submit`, { responses: { q1: 'admin value' } }, cookie);
  assert(subAdmin.status === 201, 'admin submit allowed (201)');

  // Session endpoint reports isAdmin
  const sess = await api('GET', '/api/admin/session', null, cookie);
  assert(sess.status === 200, 'session endpoint reachable');
  assert(sess.data.isAdmin === true, 'session reports isAdmin=true for admin');

  // Without cookie, session reports false
  const sessAnon = await api('GET', '/api/admin/session');
  assert(sessAnon.data.isAdmin === false, 'session reports isAdmin=false for anon');

  console.log('\n[3] Cleanup');
  const del = await api('DELETE', `/api/forms/${id}`, null, cookie);
  assert(del.status === 200, 'admin delete works');
  const gone = await api('GET', `/api/forms/${id}`);
  assert(gone.status === 404, 'form is gone');

  console.log('\nAll checks passed.');
}

main().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
