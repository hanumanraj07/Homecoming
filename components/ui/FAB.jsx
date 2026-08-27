import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function FAB({ icon, label, onPress, variant = 'primary', style, accessibilityLabel }) {
  const { colors, spacing, radii, shadows, typography } = useTheme();
  const backgroundColor = variant === 'danger' ? colors.danger : colors.primary;
  const textColor = variant === 'danger' ? colors.dangerText : colors.primaryText;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label ?? 'Action'}
      style={({ pressed }) => [
        styles.base,
        shadows.lg,
        {
          backgroundColor,
          borderRadius: label ? radii.full : 28,
          paddingHorizontal: label ? spacing.lg : 0,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {icon}
        {label ? (
          <Text
            style={{
              color: textColor,
              fontSize: typography.size.md,
              fontWeight: typography.weight.semibold,
              marginLeft: icon ? spacing.sm : 0,
            }}
          >
            {label}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
