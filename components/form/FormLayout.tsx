'use client';

import { Form } from '@/types';
import { colors } from '@/lib/colors';

interface FormLayoutProps {
  form: Form;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  isSubmitted?: boolean;
}

export function FormLayout({
  form,
  children,
  onSubmit,
  isSubmitting = false,
  isSubmitted = false,
}: FormLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', background: colors.dark, padding: '32px 16px', paddingBottom: '64px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 600, color: colors.textPrimary, marginBottom: '12px' }}>
            {form.title}
          </h1>
          {form.description && (
            <p style={{ fontSize: '16px', color: colors.textSecondary, lineHeight: '1.6' }}>
              {form.description}
            </p>
          )}
          {form.questions.length > 0 && (
            <p style={{ fontSize: '14px', color: colors.textMuted, marginTop: '16px' }}>
              {form.questions.length} question{form.questions.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Form */}
        {isSubmitted ? (
          <div style={{
            background: colors.dark2,
            border: `0.5px solid ${colors.borderStrong}`,
            borderRadius: '12px',
            padding: '48px 32px',
            textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: `${colors.brand}33`,
              marginBottom: '24px',
            }}>
              <svg style={{ width: '32px', height: '32px', color: colors.brand, fill: 'currentColor' }} viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: colors.textPrimary, marginBottom: '8px' }}>
              Response recorded!
            </h2>
            <p style={{ color: colors.textSecondary }}>
              Thank you for completing this form.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {children}

            {/* Submit Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '32px',
              borderTop: `1px solid ${colors.borderStrong}`,
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              <p style={{ fontSize: '14px', color: colors.textMuted }}>
                All fields marked with <span style={{ color: colors.error }}>*</span> are required
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '0 22px',
                  height: '48px',
                  borderRadius: '100px',
                  fontWeight: 500,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  background: colors.brand,
                  color: '#fff',
                  border: 'none',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  opacity: isSubmitting ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    (e.currentTarget as HTMLButtonElement).style.background = colors.brandLight;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    (e.currentTarget as HTMLButtonElement).style.background = colors.brand;
                  }
                }}
                title={isSubmitting ? 'Submitting...' : 'Submit'}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
