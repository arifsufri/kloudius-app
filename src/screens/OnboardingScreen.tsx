import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBackdrop } from '@/components/BrandBackdrop';
import { Button } from '@/components/Button';
import type { RootStackScreenProps } from '@/navigation/types';
import { colors, fonts, radius, spacing } from '@/theme';

const logo = require('../../assets/kloudius-logo.webp');

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'Menlo, monospace' });

/** Dark editor palette for the hero code window. */
const editor = {
  background: '#15171D',
  titleBar: '#1F222A',
  border: '#2A2E38',
  lineNumber: '#4B5263',
  plain: '#D5D9E2',
  keyword: '#FF6B72',
  method: '#7AB8FF',
  string: '#9BE38F',
  literal: '#F5B86A',
  success: '#4ADE80',
};

type Token = [text: string, color: string];

const CODE: Token[][] = [
  [['const ', editor.keyword], ['app ', editor.plain], ['= ', editor.plain], ['kloudius', colors.primary]],
  [['  .', editor.plain], ['build', editor.method], ['({ fast: ', editor.plain], ['true', editor.literal], [' })', editor.plain]],
  [['  .', editor.plain], ['scale', editor.method], ['(', editor.plain], ["'auto'", editor.string], [')', editor.plain]],
  [['  .', editor.plain], ['deploy', editor.method], ['();', editor.plain]],
];

export default function OnboardingScreen({ navigation }: RootStackScreenProps<'Onboarding'>) {
  const { width, height } = useWindowDimensions();

  // The code window starts hidden above the screen, falls in and bounces to rest at a slight
  // tilt. Easing.bounce stays within 0..1, so every interpolation lands exactly on its final value.
  const drop = useRef(new Animated.Value(0)).current;
  const cursor = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(drop, {
      toValue: 1,
      duration: 1100,
      delay: 250,
      easing: Easing.bounce,
      useNativeDriver: true,
    }).start();

    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursor, { toValue: 0, duration: 0, delay: 530, useNativeDriver: true }),
        Animated.timing(cursor, { toValue: 1, duration: 0, delay: 530, useNativeDriver: true }),
      ]),
    );
    blink.start();
    return () => blink.stop();
  }, [drop, cursor]);

  const translateY = drop.interpolate({ inputRange: [0, 1], outputRange: [-height, 0] });
  const rotate = drop.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: ['16deg', '-11deg', '-7deg'],
  });
  // The stacked card behind only appears once the window is near the table.
  const shadowOpacity = drop.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 0, 1] });

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandBackdrop />

      <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="Kloudius" />

      <View style={styles.hero}>
        {/* The hero doesn't scroll, so cap Dynamic Type growth to keep it on one screen. */}
        <Text style={styles.headline} maxFontSizeMultiplier={1.2}>
          {'Build fast,\nscale smart,'}
        </Text>

        <Animated.View
          style={[
            styles.windowWrap,
            // Deliberately wide so the window bleeds off the right edge.
            { width: width * 0.9, marginLeft: width * 0.12 },
            { transform: [{ translateY }, { rotate }] },
          ]}
        >
          <Animated.View style={[styles.windowShadow, { opacity: shadowOpacity }]} />

          <View style={styles.window} accessible accessibilityLabel="Code editor deploying an app">
            <View style={styles.titleBar}>
              <View style={[styles.trafficLight, { backgroundColor: '#FF5F57' }]} />
              <View style={[styles.trafficLight, { backgroundColor: '#FEBC2E' }]} />
              <View style={[styles.trafficLight, { backgroundColor: '#28C840' }]} />
              <View style={styles.tab}>
                <View style={styles.tabDot} />
                <Text style={styles.tabText} allowFontScaling={false}>
                  deploy.ts
                </Text>
              </View>
            </View>

            <View style={styles.code}>
              {CODE.map((line, i) => (
                <View key={i} style={styles.codeLine}>
                  <Text style={styles.lineNumber} allowFontScaling={false}>
                    {i + 1}
                  </Text>
                  {/* Decorative illustration (labelled as a whole above), so it keeps a fixed size. */}
                  <Text style={styles.codeText} allowFontScaling={false}>
                    {line.map(([text, color], j) => (
                      <Text key={j} style={{ color }}>
                        {text}
                      </Text>
                    ))}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.terminal}>
              <Ionicons name="checkmark-circle" size={14} color={editor.success} />
              <Text style={styles.terminalText} allowFontScaling={false}>
                Deployed in 42s
              </Text>
              <Animated.View style={[styles.cursor, { opacity: cursor }]} />
            </View>
          </View>
        </Animated.View>

        <Text style={styles.headline} maxFontSizeMultiplier={1.2}>
          maximize ROI
        </Text>
        <Text style={styles.subheadline} maxFontSizeMultiplier={1.3}>
          Technology solutions redefined
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Get started"
          trailingIcon="arrow-forward"
          onPress={() => navigation.navigate('Signup')}
        />
        <Button title="Login" variant="secondary" onPress={() => navigation.navigate('Login')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },
  logo: {
    alignSelf: 'center',
    width: 160,
    height: 49,
    marginTop: spacing.sm,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headline: {
    fontFamily: fonts.extraBold,
    fontSize: 40,
    lineHeight: 46,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -1.2,
  },
  subheadline: {
    marginTop: spacing.md,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.primary,
    textAlign: 'center',
  },
  windowWrap: {
    marginVertical: spacing.md,
    zIndex: 1,
  },
  windowShadow: {
    position: 'absolute',
    left: -14,
    top: 18,
    right: 14,
    bottom: -18,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(188, 24, 34, 0.12)',
  },
  window: {
    backgroundColor: editor.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: editor.border,
    overflow: 'hidden',
    shadowColor: colors.text,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md - 2,
    height: 36,
    backgroundColor: editor.titleBar,
  },
  trafficLight: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: spacing.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: editor.background,
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  tabText: {
    fontFamily: mono,
    fontSize: 11,
    color: editor.plain,
  },
  code: {
    paddingVertical: spacing.md - 2,
    paddingRight: spacing.md,
    gap: 4,
  },
  codeLine: {
    flexDirection: 'row',
  },
  lineNumber: {
    width: 32,
    textAlign: 'right',
    marginRight: spacing.md - 2,
    fontFamily: mono,
    fontSize: 13,
    lineHeight: 20,
    color: editor.lineNumber,
  },
  codeText: {
    fontFamily: mono,
    fontSize: 13,
    lineHeight: 20,
  },
  terminal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: editor.border,
  },
  terminalText: {
    fontFamily: mono,
    fontSize: 12,
    color: editor.success,
  },
  cursor: {
    width: 7,
    height: 14,
    backgroundColor: editor.plain,
  },
  actions: {
    gap: spacing.md - spacing.xs,
    paddingBottom: spacing.md,
  },
});
