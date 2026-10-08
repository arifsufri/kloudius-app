import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Animated,
  Easing,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { BrandBackdrop } from '@/components/BrandBackdrop';
import { Button, BUTTON_HEIGHT } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts, radius, spacing } from '@/theme';

const logo = require('../../assets/kloudius-logo.webp');

const HAS_LIQUID_GLASS = isLiquidGlassAvailable();

/** Points of scroll in one direction before the floating Logout button reacts (ignores jitter). */
const SCROLL_THRESHOLD = 6;

/** Dark palette shared with the onboarding code window, so the brand "dark surface" feels consistent. */
const card = {
  background: '#15171D',
  border: '#2A2E38',
  text: '#F3F4F6',
  muted: '#9CA3AF',
  chip: 'rgba(255, 255, 255, 0.08)',
};

const SECURITY_ITEMS: { icon: keyof typeof Ionicons.glyphMap; title: string; detail: string }[] = [
  {
    icon: 'finger-print-outline',
    title: 'Password protected',
    detail: 'Salted and hashed with SHA-256, never stored as plain text',
  },
  {
    icon: 'phone-portrait-outline',
    title: 'Signed in on this device',
    detail: 'Session persisted with AsyncStorage, so you stay logged in',
  },
  {
    icon: 'git-network-outline',
    title: 'Global auth state',
    detail: 'Managed with React Context and shared across every screen',
  },
];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    // Array.from splits by code point, so an emoji or accented first letter isn't cut in half.
    .map((part) => Array.from(part)[0]!.toUpperCase())
    .join('');
}

function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Floating Logout button: slides away while scrolling down, returns on any scroll up.
  const insets = useSafeAreaInsets();
  const logoutHide = useRef(new Animated.Value(0)).current;
  const isLogoutHidden = useRef(false);
  const lastScrollY = useRef(0);

  const setLogoutHidden = useCallback(
    (hidden: boolean) => {
      if (isLogoutHidden.current === hidden) return;
      isLogoutHidden.current = hidden;
      Animated.timing(logoutHide, {
        toValue: hidden ? 1 : 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [logoutHide],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      // Clamp so iOS rubber-banding at either end doesn't read as a direction change.
      const maxY = Math.max(0, contentSize.height - layoutMeasurement.height);
      const y = Math.min(Math.max(contentOffset.y, 0), maxY);
      const delta = y - lastScrollY.current;

      if (y <= 0) {
        setLogoutHidden(false);
        lastScrollY.current = 0;
      } else if (Math.abs(delta) > SCROLL_THRESHOLD) {
        setLogoutHidden(delta > 0);
        lastScrollY.current = y;
      }
    },
    [setLogoutHidden],
  );

  if (!user) return null;

  const logoutTranslateY = logoutHide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BUTTON_HEIGHT + insets.bottom + spacing.lg],
  });


  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });
  const accountId = `KL-${user.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You’ll need to log in again to access your account.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          // On success the navigator switches back to Login automatically.
          await logout().catch(() => setIsLoggingOut(false));
        },
      },
    ]);
  };

  return (
    // No bottom edge: content scrolls to the screen edge and the floating button handles the inset.
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <BrandBackdrop />

      <View style={styles.topBar}>
        <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="Kloudius" />
        <View style={styles.avatar} accessibilityLabel={`Signed in as ${user.name}`}>
          <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          // Room so the last row can scroll clear of the floating button.
          { paddingBottom: BUTTON_HEIGHT + insets.bottom + spacing.md + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.name} numberOfLines={1}>
          {user.name.split(' ')[0]}
        </Text>

        <View style={styles.memberCard}>
          <CardGlow />

          <View style={styles.cardHeader}>
            <View style={styles.cardBrand}>
              <Ionicons name="cloud" size={18} color={colors.primary} />
              <Text style={styles.cardBrandText}>Kloudius</Text>
            </View>
            <View style={styles.statusChip}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>

          <View style={styles.cardIdentity}>
            <Text style={styles.cardLabel}>Name</Text>
            <Text style={styles.cardName} numberOfLines={2}>
              {user.name}
            </Text>
            <Text style={[styles.cardLabel, styles.cardLabelSpaced]}>Email</Text>
            {/* Middle truncation keeps the domain visible if an address is extremely long. */}
            <Text style={styles.cardEmail} numberOfLines={2} ellipsizeMode="middle">
              {user.email}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>Member since</Text>
              <Text style={styles.cardMeta}>{memberSince}</Text>
            </View>
            <View style={styles.cardFooterRight}>
              <Text style={styles.cardLabel}>Account ID</Text>
              <Text style={[styles.cardMeta, styles.mono]}>{accountId}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account security</Text>
        {/* iOS 26 Liquid Glass; elsewhere GlassView is a plain View, so it gets a frosted fallback. */}
        <GlassView
          glassEffectStyle="regular"
          colorScheme="light"
          style={[styles.list, !HAS_LIQUID_GLASS && styles.listFallback]}
        >
          {SECURITY_ITEMS.map((item, i) => (
            <View key={item.title} style={[styles.listRow, i > 0 && styles.listRowDivider]}>
              <View style={styles.listIcon}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.listText}>
                <Text style={styles.listTitle}>{item.title}</Text>
                <Text style={styles.listDetail}>{item.detail}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
          ))}
        </GlassView>
      </ScrollView>

      <Animated.View
        style={[
          styles.floatingLogout,
          { bottom: insets.bottom + spacing.md, transform: [{ translateY: logoutTranslateY }] },
        ]}
      >
        <Button
          title="Logout"
          variant="secondary"
          trailingIcon="log-out-outline"
          onPress={confirmLogout}
          loading={isLoggingOut}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const GLOW_SIZE = 340;

/**
 * Soft brand-red light that drifts slowly around inside the card. The x and y loops run at
 * different speeds so the path never visibly repeats. Respects the OS "Reduce Motion" setting.
 */
function CardGlow() {
  const driftX = useRef(new Animated.Value(0)).current;
  const driftY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const swing = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
    const drift = Animated.parallel([swing(driftX, 6000), swing(driftY, 4200)]);

    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!cancelled && !reduceMotion) drift.start();
    });
    return () => {
      cancelled = true;
      drift.stop();
    };
  }, [driftX, driftY]);

  // Starts centred on the top-right corner, then wanders left across the card and down.
  const translateX = driftX.interpolate({ inputRange: [0, 1], outputRange: [0, -200] });
  const translateY = driftY.interpolate({ inputRange: [0, 1], outputRange: [0, 130] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.glow, { transform: [{ translateX }, { translateY }] }]}
    >
      <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
        <Defs>
          <RadialGradient id="cardGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.primary} stopOpacity={0.55} />
            <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2} fill="url(#cardGlow)" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    height: 56,
  },
  logo: {
    width: 116,
    height: 36,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    color: colors.white,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  greeting: {
    fontSize: 16,
    color: colors.textMuted,
  },
  name: {
    fontFamily: fonts.extraBold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  glow: {
    position: 'absolute',
    top: -GLOW_SIZE / 2,
    right: -GLOW_SIZE / 2,
  },
  memberCard: {
    backgroundColor: card.background,
    borderRadius: radius.lg + 4,
    borderWidth: 1,
    borderColor: card.border,
    padding: spacing.lg,
    overflow: 'hidden',
    shadowColor: colors.text,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardBrandText: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: card.text,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: card.chip,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  statusText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: card.text,
  },
  cardIdentity: {
    marginTop: spacing.xl,
  },
  cardLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: card.muted,
  },
  cardLabelSpaced: {
    marginTop: spacing.md,
  },
  cardName: {
    fontFamily: fonts.extraBold,
    fontSize: 24,
    letterSpacing: -0.5,
    color: card.text,
    marginTop: 2,
  },
  cardEmail: {
    fontSize: 16,
    color: card.text,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: card.border,
  },
  cardFooterRight: {
    alignItems: 'flex-end',
  },
  cardMeta: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: card.text,
    marginTop: 2,
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: spacing.xl,
    marginBottom: spacing.sm + 2,
  },
  list: {
    borderRadius: radius.lg + 4,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  listFallback: {
    // Frosted look for devices without Liquid Glass (Android, iOS < 26).
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: colors.text,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - 4,
    paddingVertical: spacing.md - 2,
  },
  listRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(17, 24, 39, 0.12)',
  },
  listIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    // Translucent tint so the chip sits in the glass instead of on top of it.
    backgroundColor: 'rgba(188, 24, 34, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listText: {
    flex: 1,
  },
  listTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  listDetail: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 2,
  },
  floatingLogout: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    // No fill here: the Button's Liquid Glass shows content scrolling beneath. The soft shadow
    // lifts it off the page.
    borderRadius: radius.full,
    shadowColor: colors.text,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
