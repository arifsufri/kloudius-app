import { Ionicons } from '@expo/vector-icons';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/theme';

export const BUTTON_HEIGHT = 58;

const HAS_LIQUID_GLASS = isLiquidGlassAvailable();

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  /** Icon shown in a round chip at the right edge, e.g. a forward arrow on a CTA. */
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  trailingIcon,
  loading = false,
  disabled = false,
}: Props) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  const content = loading ? (
    <ActivityIndicator color={isPrimary ? colors.white : colors.text} />
  ) : (
    <>
      <Text style={[styles.text, isPrimary ? styles.primaryText : styles.secondaryText]}>
        {title}
      </Text>
      {trailingIcon && (
        <View style={[styles.iconChip, !isPrimary && styles.iconChipSecondary]}>
          <Ionicons name={trailingIcon} size={18} color={isPrimary ? colors.white : colors.text} />
        </View>
      )}
    </>
  );

  const a11y = {
    accessibilityRole: 'button' as const,
    accessibilityState: { disabled: isDisabled, busy: loading },
  };

  if (isPrimary) {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        {...a11y}
        style={({ pressed }) => [
          styles.base,
          styles.primary,
          pressed && [styles.primaryPressed, styles.pressed],
          isDisabled && styles.disabled,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  // Secondary: iOS 26 interactive Liquid Glass (native press shimmer). Elsewhere GlassView is a
  // plain View, so it falls back to a frosted white pill with our own pressed state.
  return (
    <GlassView
      glassEffectStyle="regular"
      colorScheme="light"
      isInteractive
      style={[
        styles.base,
        styles.glassShell,
        !HAS_LIQUID_GLASS && styles.secondaryFallback,
        isDisabled && styles.disabled,
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        {...a11y}
        style={({ pressed }) => [
          styles.fill,
          pressed && !HAS_LIQUID_GLASS && styles.secondaryFallbackPressed,
        ]}
      >
        {content}
      </Pressable>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  base: {
    height: BUTTON_HEIGHT,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  primary: {
    backgroundColor: colors.primary,
    // Coloured glow rather than a grey drop shadow, so the CTA feels lit from within.
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
    shadowOpacity: 0.2,
  },
  glassShell: {
    // The inner Pressable owns padding and layout so its whole area is tappable.
    paddingHorizontal: 0,
  },
  fill: {
    alignSelf: 'stretch',
    flex: 1,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  secondaryFallback: {
    // Frosted pill for devices without Liquid Glass (Android, iOS < 26).
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryFallbackPressed: {
    backgroundColor: colors.background,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.text,
  },
  iconChip: {
    position: 'absolute',
    right: 8,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  iconChipSecondary: {
    backgroundColor: colors.background,
  },
});
