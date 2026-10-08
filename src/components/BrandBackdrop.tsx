import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Mask, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/theme';

const DOT_GAP = 22;

/**
 * Decorative page background: a faint dot grid that fades out toward the edges, plus soft
 * brand-red glows in opposite corners. Purely visual, so it ignores touches and screen readers.
 */
export function BrandBackdrop() {
  const { width, height } = useWindowDimensions();

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width={width}
      height={height}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        <Pattern id="dots" width={DOT_GAP} height={DOT_GAP} patternUnits="userSpaceOnUse">
          <Circle cx={DOT_GAP / 2} cy={DOT_GAP / 2} r={1.5} fill={colors.text} fillOpacity={0.22} />
        </Pattern>

        {/* White in the middle keeps the grid visible behind the hero; it fades out at the edges. */}
        <RadialGradient id="gridFade" cx="50%" cy="45%" rx="65%" ry="45%">
          <Stop offset="0" stopColor="#fff" stopOpacity={1} />
          <Stop offset="1" stopColor="#fff" stopOpacity={0} />
        </RadialGradient>
        <Mask id="gridMask">
          <Rect width={width} height={height} fill="url(#gridFade)" />
        </Mask>

        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={colors.primary} stopOpacity={0.3} />
          <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Rect width={width} height={height} fill={colors.white} />
      <Circle cx={width * 1.05} cy={height * 0.12} r={width * 0.75} fill="url(#glow)" />
      <Circle cx={-width * 0.15} cy={height * 0.82} r={width * 0.7} fill="url(#glow)" />
      <Rect width={width} height={height} fill="url(#dots)" mask="url(#gridMask)" />
    </Svg>
  );
}
