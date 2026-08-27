import { Modal, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) {
  const { colors, spacing, radii, typography } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              padding: spacing.xl,
            },
          ]}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: typography.size.lg,
              fontWeight: typography.weight.semibold,
            }}
          >
            {title}
          </Text>
          {message ? (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.size.sm,
                marginTop: spacing.sm,
              }}
            >
              {message}
            </Text>
          ) : null}
          <View style={[styles.actions, { marginTop: spacing.xl }]}>
            <Button
              title={cancelLabel}
              variant="ghost"
              onPress={onCancel}
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <Button
              title={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              style={{ flex: 1, marginLeft: spacing.sm }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  actions: {
    flexDirection: 'row',
  },
});
