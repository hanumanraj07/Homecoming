import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const VARIANTS = ['primary', 'secondary', 'danger', 'ghost'];

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  accessibilityLabel,
}) {
  const { colors, spacing, radii, typography } = useTheme();
  const resolvedVariant = VARIANTS.includes(variant) ? variant : 'primary';
  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: { backgroundColor: colors.primary, borderColor: colors.primary, textColor: colors.primaryText },
    secondary: { backgroundColor: colors.secondarySoft, borderColor: colors.secondarySoft, textColor: colors.textPrimary },
    danger: { backgroundColor: colors.danger, borderColor: colors.danger, textColor: colors.dangerText },
    ghost: { backgroundColor: 'transparent', borderColor: colors.border, textColor: colors.textPrimary },
  }[resolvedVariant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderRadius: radii.md,
          paddingHorizontal: spacing.lg,
          opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            style={[
              {
                color: variantStyles.textColor,
                fontSize: typography.size.md,
                fontWeight: typography.weight.semibold,
                marginLeft: icon ? spacing.sm : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
