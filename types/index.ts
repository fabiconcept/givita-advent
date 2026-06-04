export type QuestionType =
  | 'multiple-choice'
  | 'checkbox'
  | 'likert-scale'
  | 'text'
  | 'textarea'
  | 'email'
  | 'ranking'
  | 'number'
  | 'date'
  | 'url'
  | 'phone'
  | 'yes-no'
  | 'rating';

export interface FormQuestion {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: string[]; // For multiple choice, checkbox, ranking
  minLabel?: string; // For likert scale
  maxLabel?: string; // For likert scale
  maxScore?: number; // For likert scale (default 5)
  order: number;
  // Newer fields
  placeholder?: string;
  min?: number;     // number
  max?: number;     // number
  unit?: string;    // number (e.g. "NGN", "years")
}

export interface Form {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  isFeatured?: boolean;
  sheetId?: string;
  sheetRange?: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  responses: Record<string, string | string[] | number>;
  submittedAt: string;
}

export interface GoogleSheetConfig {
  spreadsheetId: string;
  sheetName: string;
  apiKey: string;
}
