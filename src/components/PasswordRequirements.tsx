import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '@/theme';
import { PASSWORD_RULES } from '@/utils/validation';

const STRENGTH = [
  { label: 'Too weak', color: colors.error },
  { label: 'Weak', color: colors.error },
  { label: 'Fair', color: colors.warning },
  { label: 'Good', color: colors.warning },
  { label: 'Strong', color: colors.success },
];

/** Live strength meter plus a checklist that ticks off each password rule as it's met. */
export function PasswordRequirements({ password }: { password: string }) {
  const results = PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) }));
  const metCount = results.filter((rule) => rule.met).length;
  const strength = STRENGTH[metCount]!;

  return (
    <View style={styles.container}>
      <View style={styles.meterRow}>
        <View style={styles.meter} accessible accessibilityLabel={`Password strength: ${strength.label}`}>
          {results.map((rule, i) => (
            <View
              key={rule.id}
              style={[styles.segment, i < metCount && { backgroundColor: strength.color }]}
            />
          ))}
        </View>
        {password.length > 0 && (
          <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
        )}
      </View>

      {/* Two-column grid keeps the checklist short enough for Signup to fit without scrolling. */}
      <View style={styles.grid}>
        {results.map((rule) => (
          <View
            key={rule.id}
            style={styles.rule}
            accessible
            accessibilityLabel={`${rule.label}: ${rule.met ? 'met' : 'not met'}`}
          >
            <Ionicons
              name={rule.met ? 'checkmark-circle' : 'ellipse-outline'}
              size={15}
              color={rule.met ? colors.success : colors.textMuted}
            />
            <Text style={[styles.ruleText, rule.met && styles.ruleTextMet]} numberOfLines={1}>
              {rule.shortLabel}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Tucks up under the password field, whose container already adds bottom spacing.
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
    gap: 6,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  meter: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  strengthLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    minWidth: 56,
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
  },
  rule: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleText: {
    flexShrink: 1,
    fontSize: 13,
    color: colors.textMuted,
  },
  ruleTextMet: {
    color: colors.text,
  },
});
