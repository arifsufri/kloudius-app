const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MIN_PASSWORD_LENGTH = 6;

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validateLogin(values: { email: string; password: string }) {
  const errors: FieldErrors<'email' | 'password'> = {};

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return errors;
}

/** Rules a new password must satisfy, in the order they're shown on the Signup screen. */
export const PASSWORD_RULES = [
  {
    id: 'uppercase',
    label: 'One capital letter (A–Z)',
    shortLabel: 'Capital letter',
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    id: 'symbol',
    label: 'One special symbol (!@#$…)',
    shortLabel: 'Special symbol',
    test: (pw: string) => /[^A-Za-z0-9\s]/.test(pw),
  },
  {
    id: 'number',
    label: 'One number (0–9)',
    shortLabel: 'Number',
    test: (pw: string) => /\d/.test(pw),
  },
  {
    id: 'length',
    label: `At least ${MIN_PASSWORD_LENGTH} characters`,
    shortLabel: `${MIN_PASSWORD_LENGTH}+ characters`,
    test: (pw: string) => pw.length >= MIN_PASSWORD_LENGTH,
  },
] as const;

export function validateSignup(values: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const errors: FieldErrors<'name' | 'email' | 'password' | 'confirmPassword'> = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    // Checked first so the spec's "less than 6 characters" case gets its own explicit message.
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  } else if (!PASSWORD_RULES.every((rule) => rule.test(values.password))) {
    errors.password = 'Password doesn’t meet all the requirements below.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please re-enter your password.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords don’t match.';
  }

  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
