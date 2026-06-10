'use client';

import { FormQuestion } from '@/types';
import { colors } from '@/lib/colors';
import { useState } from 'react';

interface QuestionRendererProps {
  question: FormQuestion;
  value?: string | string[] | number;
  onChange: (value: string | string[] | number) => void;
  error?: string;
}

export function QuestionRenderer({
  question,
  value = question.type === 'checkbox' ? [] : '',
  onChange,
  error,
}: QuestionRendererProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue: string | string[] | number) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 500, color: colors.textPrimary }}>
            {question.title}
          </span>
          {question.required && <span style={{ color: colors.error, marginLeft: '4px' }}>*</span>}
        </label>
        {question.description && (
          <p style={{ fontSize: '14px', color: colors.textSecondary }}>{question.description}</p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {question.type === 'multiple-choice' && (
          <MultipleChoice
            options={question.options || []}
            value={localValue as string}
            onChange={handleChange}
          />
        )}

        {question.type === 'checkbox' && (
          <CheckboxGroup
            options={question.options || []}
            value={localValue as string[]}
            onChange={handleChange}
          />
        )}

        {question.type === 'likert-scale' && (
          <LikertScale
            value={localValue as number}
            onChange={handleChange}
            minLabel={question.minLabel}
            maxLabel={question.maxLabel}
            maxScore={question.maxScore || 5}
          />
        )}

        {question.type === 'text' && (
          <TextInput
            value={localValue as string}
            onChange={handleChange}
            placeholder="Enter your answer"
          />
        )}

        {question.type === 'textarea' && (
          <TextArea
            value={localValue as string}
            onChange={handleChange}
            placeholder="Enter your answer"
          />
        )}

        {question.type === 'email' && (
          <TextInput
            type="email"
            value={localValue as string}
            onChange={handleChange}
            placeholder="your@email.com"
          />
        )}

        {question.type === 'ranking' && (
          <RankingQuestion
            options={question.options || []}
            value={localValue as string[]}
            onChange={handleChange}
          />
        )}
      </div>

      {error && (
        <p style={{ marginTop: '8px', fontSize: '14px', color: colors.error }}>{error}</p>
      )}
    </div>
  );
}

function MultipleChoice({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {options.map((option) => (
        <label key={option} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = colors.brand;
        }} onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = 'inherit';
        }}>
          <input
            type="radio"
            name="option"
            value={option}
            checked={value === option}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: '20px', height: '20px', accentColor: colors.brand, cursor: 'pointer' }}
          />
          <span style={{ marginLeft: '12px', color: colors.textPrimary }}>
            {option}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function CheckboxGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <fieldset style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {options.map((option) => (
        <label key={option} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={value.includes(option)}
            onChange={(e) => {
              const newValue = e.target.checked
                ? [...value, option]
                : value.filter((v) => v !== option);
              onChange(newValue);
            }}
            style={{ width: '20px', height: '20px', accentColor: colors.brand, cursor: 'pointer', borderRadius: '4px' }}
          />
          <span style={{ marginLeft: '12px', color: colors.textPrimary }}>
            {option}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function LikertScale({
  value,
  onChange,
  minLabel,
  maxLabel,
  maxScore,
}: {
  value: number;
  onChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  maxScore: number;
}) {
  const scores = Array.from({ length: maxScore }, (_, i) => i + 1);

  return (
    <div>
      {minLabel || maxLabel ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.textMuted, marginBottom: '12px' }}>
          {minLabel && <span>{minLabel}</span>}
          {maxLabel && <span>{maxLabel}</span>}
        </div>
      ) : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {scores.map((score) => (
          <button
            key={score}
            onClick={() => onChange(score)}
            title={`${score} out of ${maxScore}`}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              fontWeight: 500,
              transition: 'all 0.2s',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              background: value === score ? colors.brand : colors.dark4,
              color: value === score ? '#fff' : colors.textSecondary,
              transform: value === score ? 'scale(1.1)' : 'scale(1)',
            }}
            onMouseEnter={(e) => {
              if (value !== score) {
                (e.currentTarget as HTMLButtonElement).style.background = colors.dark5;
              }
            }}
            onMouseLeave={(e) => {
              if (value !== score) {
                (e.currentTarget as HTMLButtonElement).style.background = colors.dark4;
              }
            }}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextInput({
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '12px 16px',
        background: colors.dark3,
        border: `1px solid ${colors.borderStrong}`,
        borderRadius: '8px',
        color: colors.textPrimary,
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.2s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = colors.brand;
        e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.brand}40`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = colors.borderStrong;
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      style={{
        width: '100%',
        padding: '12px 16px',
        background: colors.dark3,
        border: `1px solid ${colors.borderStrong}`,
        borderRadius: '8px',
        color: colors.textPrimary,
        fontSize: '14px',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'all 0.2s',
        resize: 'none',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = colors.brand;
        e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.brand}40`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = colors.borderStrong;
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

function RankingQuestion({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [items, setItems] = useState<string[]>(value.length > 0 ? value : options);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      setItems(newItems);
      onChange(newItems);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, index) => (
        <div
          key={item}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '12px',
            background: colors.dark3,
            border: `1px solid ${colors.borderStrong}`,
            borderRadius: '8px',
          }}
        >
          <span style={{ fontWeight: 500, color: colors.textPrimary }}>{index + 1}.</span>
          <span style={{ flex: 1, color: colors.textPrimary }}>{item}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleMove(index, 'up')}
              disabled={index === 0}
              style={{
                padding: '4px 8px',
                color: index === 0 ? colors.textMuted : colors.textSecondary,
                background: 'transparent',
                border: 'none',
                cursor: index === 0 ? 'not-allowed' : 'pointer',
                opacity: index === 0 ? 0.3 : 1,
              }}
              title="Move up"
            >
              ↑
            </button>
            <button
              onClick={() => handleMove(index, 'down')}
              disabled={index === items.length - 1}
              style={{
                padding: '4px 8px',
                color: index === items.length - 1 ? colors.textMuted : colors.textSecondary,
                background: 'transparent',
                border: 'none',
                cursor: index === items.length - 1 ? 'not-allowed' : 'pointer',
                opacity: index === items.length - 1 ? 0.3 : 1,
              }}
              title="Move down"
            >
              ↓
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
