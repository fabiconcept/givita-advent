'use client';

import { FormQuestion } from '@/types';
import { ChoiceGrid } from '@/components/form/questions/ChoiceGrid';
import { MultiSelect } from '@/components/form/questions/MultiSelect';
import { LikertScale } from '@/components/form/questions/LikertScale';
import { TextInput } from '@/components/form/questions/TextInput';
import { TextArea } from '@/components/form/questions/TextArea';
import { EmailInput } from '@/components/form/questions/EmailInput';
import { Ranking } from '@/components/form/questions/Ranking';
import { NumberInput } from '@/components/form/questions/NumberInput';
import { DateInput } from '@/components/form/questions/DateInput';
import { UrlInput } from '@/components/form/questions/UrlInput';
import { PhoneInput } from '@/components/form/questions/PhoneInput';
import { YesNoInput } from '@/components/form/questions/YesNoInput';
import { RatingInput } from '@/components/form/questions/RatingInput';
import { Hash, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernQuestionCardProps {
  question: FormQuestion;
  index: number;
  total: number;
  value?: string | string[] | number;
  onChange: (value: string | string[] | number) => void;
  error?: string;
}

export function ModernQuestionCard({ question, index, total, value, onChange, error }: ModernQuestionCardProps) {
  return (
    <article className="relative">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Hash className="h-3 w-3" />
        </span>
        <span>
          Question {index + 1} <span className="text-muted-foreground/60">of {total}</span>
        </span>
        {question.required && (
          <span className="ml-2 inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
            Required
          </span>
        )}
      </div>

      <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {question.title}
      </h2>

      {question.description && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{question.description}</p>
      )}

      <div className="mt-8">
        {question.type === 'multiple-choice' && (
          <ChoiceGrid
            options={question.options || []}
            value={(value as string) ?? ''}
            onChange={(v) => onChange(v)}
          />
        )}
        {question.type === 'checkbox' && (
          <MultiSelect
            options={question.options || []}
            value={(value as string[]) ?? []}
            onChange={(v) => onChange(v)}
          />
        )}
        {question.type === 'likert-scale' && (
          <LikertScale
            value={(value as number) ?? 0}
            onChange={(v) => onChange(v)}
            minLabel={question.minLabel}
            maxLabel={question.maxLabel}
            maxScore={question.maxScore || 5}
          />
        )}
        {question.type === 'rating' && (
          <RatingInput
            value={(value as number) ?? 0}
            onChange={(v) => onChange(v)}
            maxScore={question.maxScore || 5}
          />
        )}
        {question.type === 'text' && (
          <TextInput
            value={(value as string) ?? ''}
            onChange={(v) => onChange(v)}
            placeholder={question.placeholder}
          />
        )}
        {question.type === 'textarea' && (
          <TextArea
            value={(value as string) ?? ''}
            onChange={(v) => onChange(v)}
            placeholder={question.placeholder}
          />
        )}
        {question.type === 'email' && (
          <EmailInput
            value={(value as string) ?? ''}
            onChange={(v) => onChange(v)}
            placeholder={question.placeholder}
          />
        )}
        {question.type === 'number' && (
          <NumberInput
            value={(value as number) ?? ''}
            onChange={(v) => onChange(v)}
            placeholder={question.placeholder}
            min={question.min}
            max={question.max}
            unit={question.unit}
          />
        )}
        {question.type === 'date' && (
          <DateInput
            value={(value as string) ?? ''}
            onChange={(v) => onChange(v)}
            placeholder={question.placeholder}
          />
        )}
        {question.type === 'url' && (
          <UrlInput
            value={(value as string) ?? ''}
            onChange={(v) => onChange(v)}
            placeholder={question.placeholder}
          />
        )}
        {question.type === 'phone' && (
          <PhoneInput
            value={(value as string) ?? ''}
            onChange={(v) => onChange(v)}
            placeholder={question.placeholder}
          />
        )}
        {question.type === 'yes-no' && (
          <YesNoInput value={(value as string) ?? ''} onChange={(v) => onChange(v)} />
        )}
        {question.type === 'ranking' && (
          <Ranking options={question.options || []} value={(value as string[]) ?? []} onChange={(v) => onChange(v)} />
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </article>
  );
}
