export const colors = {
  background: '#f7fafa',
  surface: '#f7fafa',
  surfaceLowest: '#ffffff',
  surfaceLow: '#f1f4f4',
  surfaceContainer: '#ebeeee',
  surfaceVariant: '#e0e3e3',
  outline: '#6e7979',
  outlineVariant: '#bec9c9',
  text: '#181c1c',
  textMuted: '#3e4949',
  primary: '#00595c',
  primaryContainer: '#0d7377',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#a2f5f9',
  secondary: '#006d37',
  secondaryContainer: '#7af8a2',
  onSecondaryContainer: '#00723a',
  tertiary: '#7a401c',
  tertiaryContainer: '#ffdbca',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  warningContainer: '#fff1c2',
  onWarningContainer: '#6f4b00',
  infoContainer: '#d8ecff',
  onInfoContainer: '#004b75',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 40,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const typography = {
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
    color: colors.text,
  },
  heading: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as const,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    color: colors.text,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700' as const,
    color: colors.textMuted,
  },
};

export function money(value?: number | null): string {
  return `Rp ${(value ?? 0).toLocaleString('id-ID')}`;
}

export function shortDate(value?: string | null): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
