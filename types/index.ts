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
  // Validation
  minLength?: number;     // text, textarea
  maxLength?: number;     // text, textarea
  pattern?: string;       // regex (text, textarea, email, phone)
  patternMessage?: string; // custom error for pattern mismatch
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
  // Access control
  passwordHash?: string;
  passwordSalt?: string;
  // Expiry + limits
  expiresAt?: string;
  maxResponses?: number;
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
