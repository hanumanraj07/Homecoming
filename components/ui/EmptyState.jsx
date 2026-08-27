import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

export function EmptyState({ icon, title, message, actionLabel, onAction, style }) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xl }, style]}>
      {icon ? <View style={{ marginBottom: spacing.md }}>{icon}</View> : null}
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.size.lg,
          fontWeight: typography.weight.semibold,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {message ? (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.size.sm,
            textAlign: 'center',
            marginTop: spacing.xs,
          }}
        >
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={{ marginTop: spacing.lg, alignSelf: 'center', paddingHorizontal: spacing.xl }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
