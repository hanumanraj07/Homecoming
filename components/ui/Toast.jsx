import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const VARIANTS = ['info', 'success', 'warning', 'error'];

export function Toast({ visible, message, type = 'info', duration = 3000, onHide, style }) {
  const { colors, spacing, radii, typography, shadows } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    if (!visible) return undefined;

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -12, duration: 200, useNativeDriver: true }),
      ]).start(() => onHide?.());
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration]);

  if (!visible) return null;

  const resolvedType = VARIANTS.includes(type) ? type : 'info';
  const variantColors = {
    info: { bg: colors.surfaceAlt, text: colors.textPrimary },
    success: { bg: colors.successSoft, text: colors.success },
    warning: { bg: colors.warningSoft, text: colors.warning },
    error: { bg: colors.dangerSoft, text: colors.danger },
  }[resolvedType];

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        shadows.md,
        {
          backgroundColor: variantColors.bg,
          borderRadius: radii.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      <Text
        style={{ color: variantColors.text, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
  },
});
