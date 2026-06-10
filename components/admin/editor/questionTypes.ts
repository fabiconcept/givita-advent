import { FormQuestion } from '@/types';

export const QUESTION_TYPES: { value: FormQuestion['type']; label: string; group: string }[] = [
  { value: 'multiple-choice', label: 'Multiple choice', group: 'Choice' },
  { value: 'checkbox', label: 'Checkboxes', group: 'Choice' },
  { value: 'ranking', label: 'Ranking', group: 'Choice' },
  { value: 'yes-no', label: 'Yes / No', group: 'Choice' },
  { value: 'likert-scale', label: 'Likert scale', group: 'Scale' },
  { value: 'rating', label: 'Star rating', group: 'Scale' },
  { value: 'text', label: 'Short text', group: 'Text' },
  { value: 'textarea', label: 'Long text', group: 'Text' },
  { value: 'email', label: 'Email', group: 'Text' },
  { value: 'number', label: 'Number', group: 'Text' },
  { value: 'url', label: 'URL', group: 'Text' },
  { value: 'phone', label: 'Phone', group: 'Text' },
  { value: 'date', label: 'Date', group: 'Text' },
];

export interface ResponseStats {
  formId: string;
  totalResponses: number;
  stats: Record<
    string,
    {
      question: string;
      type: string;
      responses: Array<string | string[] | number>;
      count: number;
      distribution?: Record<string, number>;
      average?: number;
      values?: number[];
    }
  >;
}
