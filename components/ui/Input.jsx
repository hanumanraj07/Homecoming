import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const Input = forwardRef(function Input(
  { label, error, icon, containerStyle, style, ...inputProps },
  ref
) {
  const { colors, spacing, radii, typography } = useTheme();

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      {label ? (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium,
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputRow,
          {
            borderColor: error ? colors.danger : colors.border,
            backgroundColor: colors.surface,
            borderRadius: radii.md,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        {icon}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel={label}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              fontSize: typography.size.md,
              marginLeft: icon ? spacing.sm : 0,
            },
            style,
          ]}
          {...inputProps}
        />
      </View>
      {error ? (
        <Text
          style={{
            color: colors.danger,
            fontSize: typography.size.xs,
            marginTop: spacing.xs,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 44,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
});
