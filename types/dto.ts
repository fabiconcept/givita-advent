import type { QuestionType, FormQuestion } from './index';

export interface QuestionFieldSchema {
  options: boolean;
  minLabel: boolean;
  maxLabel: boolean;
  maxScore: boolean;
  placeholder: boolean;
  min: boolean;
  max: boolean;
  unit: boolean;
  description: boolean;
}

export const QUESTION_SCHEMA: Record<QuestionType, QuestionFieldSchema> = {
  'multiple-choice': { options: true, minLabel: false, maxLabel: false, maxScore: false, placeholder: false, min: false, max: false, unit: false, description: true },
  'checkbox':        { options: true, minLabel: false, maxLabel: false, maxScore: false, placeholder: false, min: false, max: false, unit: false, description: true },
  'ranking':         { options: true, minLabel: false, maxLabel: false, maxScore: false, placeholder: false, min: false, max: false, unit: false, description: true },
  'yes-no':          { options: false, minLabel: false, maxLabel: false, maxScore: false, placeholder: false, min: false, max: false, unit: false, description: true },
  'likert-scale':    { options: false, minLabel: true,  maxLabel: true,  maxScore: true,  placeholder: false, min: false, max: false, unit: false, description: true },
  'rating':          { options: false, minLabel: false, maxLabel: false, maxScore: true,  placeholder: true,  min: false, max: false, unit: false, description: true },
  'text':            { options: false, minLabel: false, maxLabel: false, maxScore: false, placeholder: true,  min: false, max: false, unit: false, description: true },
  'textarea':        { options: false, minLabel: false, maxLabel: false, maxScore: false, placeholder: true,  min: false, max: false, unit: false, description: true },
  'email':           { options: false, minLabel: false, maxLabel: false, maxScore: false, placeholder: true,  min: false, max: false, unit: false, description: true },
  'number':          { options: false, minLabel: false, maxLabel: false, maxScore: false, placeholder: true,  min: true,  max: true,  unit: true,  description: true },
  'url':             { options: false, minLabel: false, maxLabel: false, maxScore: false, placeholder: true,  min: false, max: false, unit: false, description: true },
  'phone':           { options: false, minLabel: false, maxLabel: false, maxScore: false, placeholder: true,  min: false, max: false, unit: false, description: true },
  'date':            { options: false, minLabel: false, maxLabel: false, maxScore: false, placeholder: true,  min: false, max: false, unit: false, description: true },
};

const VALID_TYPES = new Set(Object.keys(QUESTION_SCHEMA));

export interface ImportRow {
  title: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  description?: string;
  placeholder?: string;
  minLabel?: string;
  maxLabel?: string;
  maxScore?: number;
  min?: number;
  max?: number;
  unit?: string;
  repeat?: number;
}

export type ImportResult = {
  valid: true;
  questions: ImportRow[];
} | {
  valid: false;
  error: string;
  line?: number;
}

export function parseJSONImport(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { valid: false, error: 'Invalid JSON' };
  }
  if (!Array.isArray(parsed)) {
    return { valid: false, error: 'Expected a JSON array of question objects' };
  }
  const questions: ImportRow[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const row = parsed[i] as Record<string, unknown>;
    if (!row || typeof row !== 'object') {
      return { valid: false, error: `Row ${i + 1}: expected an object`, line: i + 1 };
    }
    const title = String(row.title ?? '').trim();
    if (!title) {
      return { valid: false, error: `Row ${i + 1}: title is required`, line: i + 1 };
    }
    const type = String(row.type ?? '').trim() as QuestionType;
    if (!VALID_TYPES.has(type)) {
      return { valid: false, error: `Row ${i + 1}: invalid type "${type}". Valid: ${[...VALID_TYPES].join(', ')}`, line: i + 1 };
    }
    const schema = QUESTION_SCHEMA[type];
    const required = row.required === true || row.required === 'true';
    const q: ImportRow = { title, type, required };
    if (row.description && schema.description) q.description = String(row.description);
    if (schema.options && row.options) {
      q.options = (Array.isArray(row.options) ? row.options : String(row.options).split('|')).map(String);
    }
    if (schema.placeholder && row.placeholder) q.placeholder = String(row.placeholder);
    if (schema.minLabel && row.minLabel) q.minLabel = String(row.minLabel);
    if (schema.maxLabel && row.maxLabel) q.maxLabel = String(row.maxLabel);
    if (schema.maxScore && row.maxScore != null) q.maxScore = Number(row.maxScore);
    if (schema.min && row.min != null) q.min = Number(row.min);
    if (schema.max && row.max != null) q.max = Number(row.max);
    if (schema.unit && row.unit) q.unit = String(row.unit);
    if (row.repeat != null) q.repeat = Math.max(1, Number(row.repeat));
    questions.push(q);
  }
  return { valid: true, questions };
}

export function parseCSVImport(text: string): ImportResult {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { valid: false, error: 'CSV must have a header row and at least one data row' };
  }
  const headers = parseCSVLine(lines[0]);
  const questions: ImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length === 0) continue;
    if (fields.length !== headers.length) {
      return { valid: false, error: `Row ${i}: expected ${headers.length} columns, got ${fields.length}`, line: i + 1 };
    }
    const row: Record<string, string> = {};
    headers.forEach((h, j) => { row[h.trim().toLowerCase()] = fields[j].trim(); });
    const title = (row.title ?? '').trim();
    if (!title) {
      return { valid: false, error: `Row ${i + 1}: title is required`, line: i + 1 };
    }
    const type = (row.type ?? '').trim() as QuestionType;
    if (!VALID_TYPES.has(type)) {
      return { valid: false, error: `Row ${i + 1}: invalid type "${type}"`, line: i + 1 };
    }
    const schema = QUESTION_SCHEMA[type];
    const required = row.required === 'true' || row.required === 'yes' || row.required === '1';
    const q: ImportRow = { title, type, required };
    if (row.description && schema.description) q.description = row.description;
    if (schema.options && row.options) {
      q.options = row.options.split('|').map(s => s.trim()).filter(Boolean);
    }
    if (schema.placeholder && row.placeholder) q.placeholder = row.placeholder;
    if (schema.minLabel && row.minLabel) q.minLabel = row.minLabel;
    if (schema.maxLabel && row.maxLabel) q.maxLabel = row.maxLabel;
    if (schema.maxScore && row.maxscore) q.maxScore = Number(row.maxscore);
    if (schema.min && row.min) q.min = Number(row.min);
    if (schema.max && row.max) q.max = Number(row.max);
    if (schema.unit && row.unit) q.unit = row.unit;
    if (row.repeat) q.repeat = Math.max(1, Number(row.repeat));
    questions.push(q);
  }
  if (questions.length === 0) {
    return { valid: false, error: 'No valid questions found in CSV' };
  }
  return { valid: true, questions };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

export function expandRepeatRows(rows: ImportRow[]): ImportRow[] {
  const expanded: ImportRow[] = [];
  for (const row of rows) {
    const n = row.repeat ?? 1;
    for (let i = 0; i < n; i++) {
      expanded.push({
        ...row,
        repeat: undefined,
        title: n > 1 ? `${row.title} ${i + 1}` : row.title,
      });
    }
  }
  return expanded;
}

export function importRowsToQuestions(rows: ImportRow[]): FormQuestion[] {
  const expanded = expandRepeatRows(rows);
  return expanded.map((r, i) => ({
    id: `q${Date.now()}_${i}`,
    title: r.title,
    type: r.type,
    required: r.required,
    order: i + 1,
    ...(r.description ? { description: r.description } : {}),
    ...(r.options ? { options: r.options } : {}),
    ...(r.placeholder ? { placeholder: r.placeholder } : {}),
    ...(r.minLabel ? { minLabel: r.minLabel } : {}),
    ...(r.maxLabel ? { maxLabel: r.maxLabel } : {}),
    ...(r.maxScore ? { maxScore: r.maxScore } : {}),
    ...(r.min != null ? { min: r.min } : {}),
    ...(r.max != null ? { max: r.max } : {}),
    ...(r.unit ? { unit: r.unit } : {}),
  }));
}
