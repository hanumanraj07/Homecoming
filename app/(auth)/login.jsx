import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { isValidEmail } from '../../utils/validation';

export default function LoginScreen() {
  const { colors, spacing, typography } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address';
    if (!password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch (err) {
      setFormError(err.response?.data?.error ?? 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl }}>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.size.display,
            fontWeight: typography.weight.bold,
            marginBottom: spacing.xs,
          }}
        >
          Welcome back
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.size.md,
            marginBottom: spacing.xl,
          }}
        >
          Sign in to keep your guardians in the loop.
        </Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
        />

        {formError ? (
          <Text style={{ color: colors.danger, fontSize: typography.size.sm, marginBottom: spacing.md }}>
            {formError}
          </Text>
        ) : null}

        <Button title="Log in" onPress={handleSubmit} loading={isSubmitting} style={{ marginTop: spacing.sm }} />

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl }}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm }}>Don't have an account? </Text>
          <Link href="/register" replace>
            <Text style={{ color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
              Sign up
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
