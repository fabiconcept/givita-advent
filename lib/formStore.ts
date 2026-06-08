import { Form, FormResponse, FormQuestion } from '@/types';
import {
  appendRow as sheetsAppend,
  readRows as sheetsRead,
  updateRow as sheetsUpdate,
  deleteRow as sheetsDelete,
  isSheetsAvailable,
  invalidateCache as invalidateSheetsCache,
} from '@/lib/google-sheets';
import { logger } from '@/lib/logger';

const FORMS_TAB = 'Forms';
const RESPONSES_TAB = 'Responses';

// ----- In-memory fallback (used when Google Sheets isn't configured) -----
const memoryForms = new Map<string, Form>();
const memoryResponses = new Map<string, FormResponse[]>();

function isEmptyRow(row: Record<string, string | number | boolean | null | undefined>) {
  return Object.values(row).every((v) => v === '' || v === null || v === undefined);
}

function parseQuestions(json: string | undefined): FormQuestion[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as FormQuestion[]) : [];
  } catch {
    return [];
  }

  // satisfy the linter — unreachable
  return [];
}

function parseResponses(json: string | undefined): Record<string, string | string[] | number> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string | string[] | number>;
    }
  } catch {
    /* fall through */
  }
  return {};
}

function rowToForm(row: Record<string, string | number | boolean | null | undefined>): Form {
  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    isPublished: row.ispublished === 'true' || row.ispublished === 'TRUE' || row.ispublished === '1' || row.ispublished === 'yes',
    isFeatured: row.isfeatured === 'true' || row.isfeatured === 'TRUE' || row.isfeatured === '1' || row.isfeatured === 'yes',
    createdAt: String(row.createdat ?? ''),
    updatedAt: String(row.updatedat ?? ''),
    questions: parseQuestions(typeof row.questionsjson === 'string' ? row.questionsjson : undefined),
  };
}

function rowToResponse(row: Record<string, string | number | boolean | null | undefined>): FormResponse {
  return {
    id: String(row.id ?? ''),
    formId: String(row.formid ?? ''),
    responses: parseResponses(typeof row.answersjson === 'string' ? row.answersjson : undefined),
    submittedAt: String(row.submittedat ?? ''),
  };
}

function formToRow(form: Form) {
  return {
    id: form.id,
    title: form.title,
    description: form.description,
    isPublished: form.isPublished ? 'true' : 'false',
    isFeatured: form.isFeatured ? 'true' : 'false',
    createdAt: form.createdAt,
    updatedAt: form.updatedAt,
    questionsJson: JSON.stringify(form.questions ?? []),
  };
}

function responseToRow(formId: string, response: FormResponse) {
  return {
    id: response.id,
    formId,
    submittedAt: response.submittedAt,
    answersJson: JSON.stringify(response.responses ?? {}),
  };
}

// ----- Sample seed form -----
function sampleForm(): Form {
  return {
    id: 'community-fundraising',
    title: 'Community Fundraising Initiative Survey',
    description:
      'Help us understand your perspective on our community fundraising efforts. Your feedback is valuable and will help us improve.',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        title: 'What is your primary interest in community fundraising?',
        type: 'multiple-choice',
        required: true,
        options: ['Education programs', 'Health initiatives', 'Environmental projects', 'Arts and culture'],
        order: 1,
      },
      {
        id: 'q2',
        title: 'Which areas would you like to contribute to? (Select all that apply)',
        type: 'checkbox',
        required: true,
        options: ['Volunteering', 'Financial support', 'In-kind donations', 'Event organizing'],
        order: 2,
      },
      {
        id: 'q3',
        title: 'How often can you participate in community activities?',
        type: 'multiple-choice',
        required: true,
        options: ['Weekly', 'Monthly', 'Quarterly', 'Annually', 'As needed'],
        order: 3,
      },
      {
        id: 'q4',
        title: 'Rate your satisfaction with current community programs',
        type: 'likert-scale',
        required: true,
        minLabel: 'Very unsatisfied',
        maxLabel: 'Very satisfied',
        maxScore: 5,
        order: 4,
      },
      {
        id: 'q5',
        title: 'What specific projects would you like to see funded?',
        type: 'textarea',
        required: false,
        description: 'Please share your ideas or suggestions',
        order: 5,
      },
      {
        id: 'q6',
        title: 'What is your email address?',
        type: 'email',
        required: true,
        order: 6,
      },
      {
        id: 'q7',
        title: 'How did you hear about this fundraising initiative?',
        type: 'multiple-choice',
        required: true,
        options: ['Social media', 'Friend/Family', 'Local news', 'Community notice board', 'Website'],
        order: 7,
      },
      {
        id: 'q8',
        title: 'What is your age group?',
        type: 'multiple-choice',
        required: false,
        options: ['18-25', '26-35', '36-50', '51-65', '65+', 'Prefer not to say'],
        order: 8,
      },
    ],
  };
}

let seedPromise: Promise<void> | null = null;

async function ensureSeed(): Promise<void> {
  const sheetsAvail = isSheetsAvailable();
  logger.debug('formStore', `ensureSeed: sheetsAvailable=${sheetsAvail} memoryForms.size=${memoryForms.size}`);
  if (!sheetsAvail) {
    if (memoryForms.size === 0) {
      const sf = sampleForm();
      logger.info('formStore', 'Seeding in-memory fallback form (sheets not available)');
      memoryForms.set(sf.id, sf);
      memoryResponses.set(sf.id, []);
    }
    return;
  }
  if (seedPromise) {
    logger.debug('formStore', 'Seed already in progress, awaiting');
    return seedPromise;
  }
  seedPromise = (async () => {
    try {
      const { rows } = await sheetsRead(FORMS_TAB);
      logger.debug('formStore', `Sheets read ${FORMS_TAB}: ${rows.length} rows returned`);
      const hasSample = rows.some((r) => !isEmptyRow(r) && r.id === 'community-fundraising');
      logger.debug('formStore', `Has sample form: ${hasSample}`);
      if (!hasSample) {
        try {
          logger.info('formStore', 'Seeding sample form to Google Sheets');
          await sheetsAppend(FORMS_TAB, formToRow(sampleForm()));
        } catch (err) {
          logger.error('formStore', 'Failed to seed sample form:', err);
        }
      }
    } catch (err) {
      logger.error('formStore', 'Failed to read forms for seed:', err);
    }
  })();
  return seedPromise;
}

export async function getForm(id: string): Promise<Form | null> {
  logger.debug('formStore', `getForm(${id})`);
  await ensureSeed();
  if (!isSheetsAvailable()) {
    const f = memoryForms.get(id) || null;
    logger.debug('formStore', `getForm(${id}) from memory: ${f ? 'found' : 'not found'}`);
    return f;
  }
  const { rows } = await sheetsRead(FORMS_TAB);
  const match = rows.find((r) => r.id === id);
  if (!match || isEmptyRow(match)) {
    logger.debug('formStore', `getForm(${id}) not found in sheets`);
    return null;
  }
  logger.debug('formStore', `getForm(${id}) found in sheets`);
  return rowToForm(match);
}

export async function getAllForms(): Promise<Form[]> {
  logger.debug('formStore', 'getAllForms()');
  await ensureSeed();
  if (!isSheetsAvailable()) {
    const result = Array.from(memoryForms.values());
    logger.debug('formStore', `getAllForms() from memory: ${result.length} forms`);
    return result;
  }
  const { rows } = await sheetsRead(FORMS_TAB);
  const result = rows.filter((r) => !isEmptyRow(r)).map(rowToForm);
  logger.debug('formStore', `getAllForms() from sheets: ${result.length} forms (${rows.length} raw rows)`);
  return result;
}

export async function createForm(form: Form): Promise<Form> {
  await ensureSeed();
  if (!isSheetsAvailable()) {
    memoryForms.set(form.id, form);
    memoryResponses.set(form.id, []);
    return form;
  }
  const existing = await getForm(form.id);
  if (existing) {
    throw new Error(`A form with id "${form.id}" already exists.`);
  }
  await sheetsAppend(FORMS_TAB, formToRow(form));
  return form;
}

export async function updateForm(id: string, updates: Partial<Form>): Promise<Form | null> {
  await ensureSeed();
  if (!isSheetsAvailable()) {
    const current = memoryForms.get(id);
    if (!current) return null;
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    memoryForms.set(id, updated);
    return updated;
  }
  const { rows } = await sheetsRead(FORMS_TAB, { skipCache: true });
  const rowIndex = rows.findIndex((r) => r.id === id);
  if (rowIndex === -1 || isEmptyRow(rows[rowIndex])) return null;
  const current = rowToForm(rows[rowIndex]);
  const updated: Form = { ...current, ...updates, updatedAt: new Date().toISOString() };
  await sheetsUpdate(FORMS_TAB, rowIndex + 2, formToRow(updated));
  invalidateSheetsCache(FORMS_TAB);
  return updated;
}

export async function deleteForm(id: string): Promise<boolean> {
  await ensureSeed();

  if (!isSheetsAvailable()) {
    if (memoryForms.size <= 1) throw new Error('At least one form must exist. Cannot delete the only form.');
    memoryResponses.delete(id);
    return memoryForms.delete(id);
  }

  const { rows } = await sheetsRead(FORMS_TAB, { skipCache: true });
  const rowIndex = rows.findIndex((r) => r.id === id);
  if (rowIndex === -1 || isEmptyRow(rows[rowIndex])) return false;

  const nonEmpty = rows.filter((r) => !isEmptyRow(r));
  if (nonEmpty.length <= 1) throw new Error('At least one form must exist. Cannot delete the only form.');
  try {
    await sheetsDelete(FORMS_TAB, rowIndex + 2);
  } catch (err) {
    console.error('[formStore] deleteForm failed:', err);
    return false;
  }
  invalidateSheetsCache(FORMS_TAB);
  // Also wipe its responses
  const respRows = (await sheetsRead(RESPONSES_TAB, { skipCache: true })).rows;
  for (let i = respRows.length - 1; i >= 0; i--) {
    if (respRows[i].formid === id) {
      try {
        await sheetsDelete(RESPONSES_TAB, i + 2);
      } catch (err) {
        console.error('[formStore] deleteForm: failed to delete response', i, err);
      }
    }
  }
  return true;
}

export async function addResponse(
  formId: string,
  response: FormResponse
): Promise<FormResponse> {
  await ensureSeed();
  if (!isSheetsAvailable()) {
    const list = memoryResponses.get(formId) || [];
    list.push(response);
    memoryResponses.set(formId, list);
    return response;
  }
  await sheetsAppend(RESPONSES_TAB, responseToRow(formId, response));
  return response;
}

export async function getResponses(formId: string): Promise<FormResponse[]> {
  await ensureSeed();
  if (!isSheetsAvailable()) {
    return memoryResponses.get(formId) || [];
  }
  const { rows } = await sheetsRead(RESPONSES_TAB);
  return rows
    .filter((r) => !isEmptyRow(r) && r.formid === formId)
    .map(rowToResponse)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

export async function getResponseStats(formId: string) {
  const form = await getForm(formId);
  if (!form) return null;

  const formResponses = await getResponses(formId);
  const stats: Record<string, any> = {};

  form.questions.forEach((question) => {
    const questionResponses = formResponses
      .map((r) => r.responses[question.id])
      .filter((r) => r !== undefined && r !== null && r !== '');

    stats[question.id] = {
      question: question.title,
      type: question.type,
      responses: questionResponses,
      count: questionResponses.length,
    };

    if (question.type === 'multiple-choice') {
      const counts: Record<string, number> = {};
      questionResponses.forEach((r) => {
        const k = r as string;
        counts[k] = (counts[k] || 0) + 1;
      });
      stats[question.id].distribution = counts;
    } else if (question.type === 'checkbox') {
      const counts: Record<string, number> = {};
      questionResponses.forEach((r) => {
        const items = Array.isArray(r) ? r : [r];
        items.forEach((item) => {
          const k = item as string;
          counts[k] = (counts[k] || 0) + 1;
        });
      });
      stats[question.id].distribution = counts;
    } else if (question.type === 'likert-scale' || question.type === 'rating') {
      const numbers = questionResponses.map(Number).filter((n) => !isNaN(n));
      stats[question.id].average =
        numbers.length > 0 ? Number((numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2)) : 0;
      stats[question.id].values = numbers;
      const counts: Record<string, number> = {};
      numbers.forEach((n) => { const k = String(n); counts[k] = (counts[k] || 0) + 1; });
      stats[question.id].distribution = counts;
    }
  });

  return {
    formId,
    totalResponses: formResponses.length,
    stats,
  };
}
