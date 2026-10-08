import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import type { RootStackScreenProps } from '@/navigation/types';
import { AuthError } from '@/services/authService';
import { spacing } from '@/theme';
import { FieldErrors, hasErrors, validateLogin } from '@/utils/validation';

type Field = 'email' | 'password';

export default function LoginScreen({ navigation }: RootStackScreenProps<'Login'>) {
  const { login } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const [values, setValues] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<Field>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field: Field) => (text: string) => {
    setValues((prev) => ({ ...prev, [field]: text }));
    // Clear errors as the user corrects their input.
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  };

  const handleLogin = async () => {
    // The button is disabled while loading, but the keyboard's "go" key isn't.
    if (isSubmitting) return;
    const errors = validateLogin(values);
    setFieldErrors(errors);
    setFormError(null);
    if (hasErrors(errors)) return;

    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      // On success the navigator switches to Home automatically.
    } catch (error) {
      setFormError(
        error instanceof AuthError ? error.message : 'Something went wrong. Please try again.',
      );
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue to your account"
      switchPrompt="Don't have an account?"
      switchLabel="Signup"
      // Replace (not push) so Back always returns to Onboarding instead of ping-ponging.
      onSwitch={() => navigation.replace('Signup')}
    >
      <ErrorBanner message={formError} />

      <TextField
        label="Email"
        icon="mail-outline"
        placeholder="Enter your email"
        value={values.email}
        onChangeText={setField('email')}
        error={fieldErrors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        submitBehavior="submit"
      />

      <TextField
        ref={passwordRef}
        label="Password"
        icon="key-outline"
        placeholder="Enter your password"
        value={values.password}
        onChangeText={setField('password')}
        error={fieldErrors.password}
        isPassword
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleLogin}
      />

      <View style={styles.submit}>
        <Button
          title="Login"
          trailingIcon="arrow-forward"
          onPress={handleLogin}
          loading={isSubmitting}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  submit: {
    marginTop: spacing.sm,
  },
});
