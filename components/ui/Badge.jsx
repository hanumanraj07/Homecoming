import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const VARIANTS = ['neutral', 'primary', 'success', 'warning', 'danger'];

export function Badge({ label, variant = 'neutral', size = 'md', style }) {
  const { colors, spacing, radii, typography } = useTheme();
  const resolvedVariant = VARIANTS.includes(variant) ? variant : 'neutral';

  const variantColors = {
    neutral: { bg: colors.surfaceAlt, text: colors.textSecondary },
    primary: { bg: colors.primarySoft, text: colors.primary },
    success: { bg: colors.successSoft, text: colors.success },
    warning: { bg: colors.warningSoft, text: colors.warning },
    danger: { bg: colors.dangerSoft, text: colors.danger },
  }[resolvedVariant];

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        {
          backgroundColor: variantColors.bg,
          borderRadius: radii.full,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
          paddingVertical: isSmall ? 2 : spacing.xs,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        style={{
          color: variantColors.text,
          fontSize: isSmall ? typography.size.xs : typography.size.sm,
          fontWeight: typography.weight.medium,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
