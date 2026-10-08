import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBackdrop } from '@/components/BrandBackdrop';
import { colors, fonts, spacing } from '@/theme';

const logo = require('../../assets/kloudius-logo.webp');

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Footer prompt + link for switching between Login and Signup, e.g. "New here?" / "Sign up". */
  switchPrompt: string;
  switchLabel: string;
  onSwitch: () => void;
};

/** Shared shell for the Login and Signup screens: back button, brand header, form card, footer. */
export function AuthLayout({ title, subtitle, children, switchPrompt, switchLabel, onSwitch }: Props) {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandBackdrop />

      <View style={styles.topBar}>
        {navigation.canGoBack() && (
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        )}
        <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="Kloudius" />
      </View>

      {/*
        Top-aligned content that stays put while the keyboard slides over it, the standard iOS
        pattern. The ScrollView's insets grow with the keyboard so the focused field is scrolled into
        view natively, instead of a KeyboardAvoidingView shrinking the screen and re-centring
        everything (which made the form jump). Android resizes the window for the keyboard itself.
      */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        // Content is sized to fit the screen; only scroll when it must (e.g. keyboard open).
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View>{children}</View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{switchPrompt}</Text>
          <Pressable onPress={onSwitch} hitSlop={10} accessibilityRole="link">
            {({ pressed }) => (
              <Text style={[styles.footerLink, pressed && styles.footerLinkPressed]}>
                {switchLabel}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backPressed: {
    backgroundColor: colors.background,
  },
  logo: {
    width: 128,
    height: 39,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1,
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  footerLink: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.primary,
  },
  footerLinkPressed: {
    color: colors.primaryPressed,
  },
});
