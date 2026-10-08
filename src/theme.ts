export const colors = {
  background: '#F5F6FA',
  surface: '#FFFFFF',
  /** Kloudius brand red, sampled from assets/kloudius-logo.webp. */
  primary: '#BC1822',
  primaryPressed: '#9C121B',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  // Focus uses ink rather than brand red so a focused field never looks like an error.
  borderFocused: '#111827',
  // Mostly opaque white so fields sit cleanly on the dotted backdrop without a card behind them.
  inputBackground: 'rgba(255, 255, 255, 0.92)',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  errorBackground: '#FEF2F2',
  errorBorder: '#FECACA',
  white: '#FFFFFF',
};

/** Plus Jakarta Sans weights, loaded in App.tsx. */
export const fonts = {
  semiBold: 'PlusJakartaSans_600SemiBold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  md: 14,
  lg: 20,
  full: 999,
};
