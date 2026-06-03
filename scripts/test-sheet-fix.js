const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2];
  }
}
const { getForm, createForm, updateForm, addResponse, deleteForm, getAllForms } = require('../lib/formStore');
const { invalidateCache, isSheetsAvailable } = require('../lib/google-sheets');

async function main() {
  console.log('Sheets available:', isSheetsAvailable());
  invalidateCache();

  console.log('\n[1] List all forms');
  const forms = await getAllForms();
  for (const f of forms) {
    console.log(`  - ${f.id}: "${f.title}" (isPublished=${f.isPublished}, questions=${f.questions.length})`);
  }

  console.log('\n[2] Get one form');
  const sample = await getForm('community-fundraising');
  console.log(`  ${sample ? 'OK' : 'MISSING'} - questions: ${sample ? sample.questions.length : 0}`);

  console.log('\n[3] Create new form with questions');
  const newForm = {
    id: `test-fix-${Date.now()}`,
    title: 'Test Form Fix',
    description: 'Verifying sheet updates after camel/lowercase fix',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: [
      { id: 'q1', title: 'Q1', type: 'text', required: true, order: 1 },
      { id: 'q2', title: 'Q2', type: 'multiple-choice', required: false, options: ['A', 'B'], order: 2 },
    ],
  };
  await createForm(newForm);
  invalidateCache();

  const fetched = await getForm(newForm.id);
  if (!fetched) {
    console.log('  FAIL: form not found after create');
    process.exit(1);
  }
  console.log(`  questions saved: ${fetched.questions.length} (expected 2)`);
  console.log(`  isPublished: ${fetched.isPublished} (expected true)`);
  console.log(`  createdAt non-empty: ${Boolean(fetched.createdAt)} (expected true)`);
  if (fetched.questions.length !== 2 || !fetched.isPublished || !fetched.createdAt) {
    console.log('  FAIL: data was not written correctly');
    process.exit(1);
  }
  console.log('  OK');

  console.log('\n[4] Update form (add a question)');
  const updated = await updateForm(newForm.id, {
    questions: [
      ...newForm.questions,
      { id: 'q3', title: 'Q3', type: 'email', required: false, order: 3 },
    ],
  });
  if (!updated || updated.questions.length !== 3) {
    console.log('  FAIL: update did not persist new question');
    process.exit(1);
  }
  console.log(`  questions after update: ${updated.questions.length} (expected 3)`);
  console.log('  OK');

  console.log('\n[5] Submit a response');
  const res = await addResponse(newForm.id, {
    id: `r-${Date.now()}`,
    responses: { q1: 'hello', q2: 'A' },
    submittedAt: new Date().toISOString(),
  });
  if (!res) {
    console.log('  FAIL: response not saved');
    process.exit(1);
  }
  console.log('  OK');

  console.log('\n[6] Cleanup: delete test form');
  await deleteForm(newForm.id);
  invalidateCache();
  const after = await getForm(newForm.id);
  console.log(`  ${after ? 'FAIL: still exists' : 'OK: gone'}`);

  console.log('\nAll checks passed.');
}

main().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
