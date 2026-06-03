export const colors = {
  brand: '#512ef8',
  brandLight: '#7a5cfa',
  lime: '#d6ff5d',
  dark: '#141414',
  dark2: '#1e1e1e',
  dark3: '#2a2a2a',
  dark4: '#333333',
  dark5: '#3f3f3f',
  textPrimary: '#f0f0f0',
  textSecondary: '#999',
  textMuted: '#666',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  success: '#22c55e',
  error: '#ef4444',
  purpleIconBg: '#2a1f5a',
  greenIconBg: '#1a3a28',
};

export function getComputedColor(name: keyof typeof colors) {
  return colors[name];
}
