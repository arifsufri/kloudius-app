import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { PasswordRequirements } from '@/components/PasswordRequirements';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import type { RootStackScreenProps } from '@/navigation/types';
import { AuthError } from '@/services/authService';
import { spacing } from '@/theme';
import { FieldErrors, hasErrors, validateSignup } from '@/utils/validation';

type Field = 'name' | 'email' | 'password' | 'confirmPassword';

export default function SignupScreen({ navigation }: RootStackScreenProps<'Signup'>) {
  const { signup } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<Field>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field: Field) => (text: string) => {
    setValues((prev) => ({ ...prev, [field]: text }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  };

  const handleSignup = async () => {
    // The button is disabled while loading, but the keyboard's "go" key isn't.
    if (isSubmitting) return;
    const errors = validateSignup(values);
    setFieldErrors(errors);
    setFormError(null);
    if (hasErrors(errors)) return;

    setIsSubmitting(true);
    try {
      await signup(values.name, values.email, values.password);
      // New users are logged in immediately; the navigator switches to Home.
    } catch (error) {
      setFormError(
        error instanceof AuthError ? error.message : 'Something went wrong. Please try again.',
      );
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Sign up to get started with Kloudius"
      switchPrompt="Already have an account?"
      switchLabel="Login"
      // Replace (not push) so Back always returns to Onboarding instead of ping-ponging.
      onSwitch={() => navigation.replace('Login')}
    >
      <ErrorBanner message={formError} />

      <TextField
        label="Name"
        icon="person-outline"
        placeholder="Enter your name"
        value={values.name}
        onChangeText={setField('name')}
        error={fieldErrors.name}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        submitBehavior="submit"
      />

      <TextField
        ref={emailRef}
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
        placeholder="Create a password"
        value={values.password}
        onChangeText={setField('password')}
        error={fieldErrors.password}
        isPassword
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        submitBehavior="submit"
      />

      <PasswordRequirements password={values.password} />

      <TextField
        ref={confirmPasswordRef}
        label="Confirm password"
        icon="shield-checkmark-outline"
        placeholder="Re-enter your password"
        value={values.confirmPassword}
        onChangeText={setField('confirmPassword')}
        error={fieldErrors.confirmPassword}
        isPassword
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={handleSignup}
      />

      <View style={styles.submit}>
        <Button
          title="Signup"
          trailingIcon="arrow-forward"
          onPress={handleSignup}
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
