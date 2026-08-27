import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { isValidEmail, isValidPassword } from '../../utils/validation';

export default function RegisterScreen() {
  const { colors, spacing, typography } = useTheme();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = 'Name is required';
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address';
    if (!phone.trim()) nextErrors.phone = 'Phone number is required';
    if (!isValidPassword(password)) nextErrors.password = 'Password must be at least 8 characters';
    if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
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
          Create your account
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.size.md,
            marginBottom: spacing.xl,
          }}
        >
          A few details, then pick your guardians.
        </Text>

        <Input label="Name" value={name} onChangeText={setName} error={errors.name} placeholder="Jane Doe" autoComplete="name" />
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
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
          placeholder="+1 555 0100"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          placeholder="At least 8 characters"
          secureTextEntry
          autoCapitalize="none"
          textContentType="newPassword"
        />
        <Input
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={errors.confirmPassword}
          placeholder="Re-enter your password"
          secureTextEntry
          autoCapitalize="none"
        />

        {formError ? (
          <Text style={{ color: colors.danger, fontSize: typography.size.sm, marginBottom: spacing.md }}>
            {formError}
          </Text>
        ) : null}

        <Button title="Create account" onPress={handleSubmit} loading={isSubmitting} style={{ marginTop: spacing.sm }} />

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl }}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm }}>Already have an account? </Text>
          <Link href="/login" replace>
            <Text style={{ color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
              Log in
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
