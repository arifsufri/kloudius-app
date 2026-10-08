import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import type { RootStackParamList } from '@/navigation/types';
import HomeScreen from '@/screens/HomeScreen';
import LoginScreen from '@/screens/LoginScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';
import SignupScreen from '@/screens/SignupScreen';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Screens are rendered conditionally on auth state (React Navigation's
 * recommended auth-flow pattern). Logging in/out swaps the screen set, so
 * React Navigation moves to Home/Login automatically and the user can't
 * go "back" into a screen they shouldn't see.
 */
export function RootNavigator() {
  const { user, isRestoring } = useAuth();

  // Onboarding is for first-time visitors. Once someone has been signed in during this run,
  // logging out should land on Login (per the spec), so Onboarding is left out of the stack.
  const hadSession = useRef(false);
  if (user) hadSession.current = true;

  if (isRestoring) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
        animation: 'slide_from_right',
      }}
    >
      {user ? (
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        <>
          {!hadSession.current && (
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ animationTypeForReplace: 'pop' }}
            />
          )}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ animationTypeForReplace: 'pop' }}
          />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Matches the white screens it hands off to, so there's no grey flash on launch.
    backgroundColor: colors.white,
  },
});
