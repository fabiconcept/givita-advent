import { Form, FormQuestion } from '@/types';

export const STORAGE_PREFIX = 'givita:form-progress:';
export const FILLED_PREFIX = 'givita:form-filled:';

export function getStorageKey(formId: string) {
  return `${STORAGE_PREFIX}${formId}`;
}

export function getFilledKey(formId: string) {
  return `${FILLED_PREFIX}${formId}`;
}

export function estimateSeconds(form: Form) {
  let seconds = 0;
  for (const q of form.questions) {
    switch (q.type) {
      case 'multiple-choice':
      case 'checkbox':
      case 'likert-scale':
      case 'ranking':
        seconds += 6;
        break;
      case 'text':
      case 'email':
        seconds += 10;
        break;
      case 'textarea':
        seconds += 25;
        break;
      default:
        seconds += 8;
    }
  }
  return Math.max(15, seconds);
}

export function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds} sec`;
  const m = Math.round(seconds / 30) / 2;
  return `${m % 1 === 0 ? m : m.toFixed(1)} min`;
}

export interface PersistedState {
  stage: 'intro' | 'questions';
  index: number;
  responses: Record<string, string | string[] | number>;
  startedAt: string;
}

export function saveProgress(formId: string, state: PersistedState) {
  try {
    window.localStorage.setItem(getStorageKey(formId), JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

export function loadProgress(formId: string): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(getStorageKey(formId));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function markFilled(formId: string) {
  try {
    window.localStorage.removeItem(getStorageKey(formId));
    window.localStorage.setItem(getFilledKey(formId), new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export function getFilledDate(formId: string): string | null {
  try {
    return window.localStorage.getItem(getFilledKey(formId));
  } catch {
    return null;
  }
}

export function clearProgress(formId: string) {
  try {
    window.localStorage.removeItem(getStorageKey(formId));
    window.localStorage.removeItem(getFilledKey(formId));
  } catch {
    /* ignore */
  }
}
