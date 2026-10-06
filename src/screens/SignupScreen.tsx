import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import type { RootStackScreenProps } from '@/navigation/types';
import { AuthError } from '@/services/authService';
import { colors, spacing } from '@/theme';
import { FieldErrors, hasErrors, MIN_PASSWORD_LENGTH, validateSignup } from '@/utils/validation';

type Field = 'name' | 'email' | 'password';

export default function SignupScreen({ navigation }: RootStackScreenProps<'Signup'>) {
  const { signup } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<Field>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field: Field) => (text: string) => {
    setValues((prev) => ({ ...prev, [field]: text }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  };

  const handleSignup = async () => {
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

  const goToLogin = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <AuthLayout
      icon="person-add"
      title="Create account"
      subtitle="Sign up to get started"
      footer={
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Button title="Go to Login" variant="secondary" onPress={goToLogin} />
        </View>
      }
    >
      <ErrorBanner message={formError} />

      <TextField
        label="Name"
        icon="person-outline"
        placeholder="Jane Doe"
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
        placeholder="you@example.com"
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
        placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        value={values.password}
        onChangeText={setField('password')}
        error={fieldErrors.password}
        isPassword
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={handleSignup}
      />

      <View style={styles.submit}>
        <Button title="Signup" onPress={handleSignup} loading={isSubmitting} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  submit: {
    marginTop: spacing.sm,
  },
  footer: {
    gap: spacing.sm,
  },
  footerText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
  },
});
