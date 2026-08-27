import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function ListItem({ title, subtitle, leading, trailing, onPress, style }) {
  const { colors, spacing, typography } = useTheme();

  const baseStyle = [
    styles.row,
    {
      minHeight: 44,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.surface,
    },
    style,
  ];

  const content = (
    <>
      {leading ? <View style={{ marginRight: spacing.md }}>{leading}</View> : null}
      <View style={styles.textColumn}>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.size.md,
            fontWeight: typography.weight.medium,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.size.sm,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={{ marginLeft: spacing.md }}>{trailing}</View> : null}
    </>
  );

  if (!onPress) {
    return <View style={baseStyle}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [...baseStyle, { opacity: pressed ? 0.7 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
});
