import { View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function Card({ children, padded = true, style }) {
  const { colors, spacing, radii, shadows } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: padded ? spacing.lg : 0,
        },
        shadows.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
}
