import { FormQuestion } from '@/types';

function smartTypeLabel(question: FormQuestion): string {
  switch (question.type) {
    case 'email': return 'email address';
    case 'url': return 'URL';
    case 'phone': return 'phone number';
    case 'text': return 'text';
    case 'textarea': return 'answer';
    default: return 'value';
  }
}

export function validateQuestion(question: FormQuestion, value?: string | string[] | number): string | null {
  const label = smartTypeLabel(question);

  if (question.required) {
    if (value === undefined || value === null || value === '') return `Your ${label} is required`;
    if (Array.isArray(value) && value.length === 0) return `Your ${label} is required`;
  }

  if (value === undefined || value === null || value === '') return null;
  if (Array.isArray(value)) return null;

  const str = String(value);

  if (question.minLength !== undefined && str.length < question.minLength) {
    const diff = question.minLength - str.length;
    if (diff === 1) return `One more character needed — ${label} must be at least ${question.minLength} characters`;
    return `${diff} more ${diff === 1 ? 'character' : 'characters'} needed — must be at least ${question.minLength}`;
  }

  if (question.maxLength !== undefined && str.length > question.maxLength) {
    const over = str.length - question.maxLength;
    if (over === 1) return `One character too many — ${label} must be no more than ${question.maxLength} characters`;
    return `${over} ${over === 1 ? 'character' : 'characters'} too many — must be no more than ${question.maxLength}`;
  }

  if (question.pattern) {
    try {
      let body = question.pattern;
      let flags: string | undefined;
      if (body.startsWith('/')) {
        const parts = body.slice(1).split('/');
        body = parts.slice(0, -1).join('/');
        flags = parts[parts.length - 1] || undefined;
      }
      const regex = new RegExp(body, flags);
      if (!regex.test(str)) {
        return question.patternMessage || `This ${label} doesn't match the expected format`;
      }
    } catch {
      /* invalid regex — skip silently */
    }
  }

  if (question.type === 'email' && str.length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(str)) {
      if (!str.includes('@')) return `Missing the @ symbol — enter a full email address (e.g. name@domain.com)`;
      if (!str.split('@')[1].includes('.')) return `Missing the domain extension — enter a full email address (e.g. name@domain.com)`;
      return 'Enter a valid email address';
    }
  }

  if (question.type === 'url' && str.length > 0) {
    try {
      new URL(str);
    } catch {
      if (!str.startsWith('http://') && !str.startsWith('https://')) return 'URL should start with https:// or http://';
      return 'Enter a valid URL';
    }
  }

  if (question.type === 'phone' && str.length > 0) {
    const digits = str.replace(/\D/g, '');
    if (digits.length < 7) return 'Phone number too short — include the full number with area code';
    if (digits.length > 15) return 'Phone number too long — check that you entered it correctly';
  }

  return null;
}
