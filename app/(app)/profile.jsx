import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, ConfirmDialog } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const { colors, spacing, typography } = useTheme();
  const { user, logout } = useAuth();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleLogout = async () => {
    setConfirmVisible(false);
    await logout();
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.xl }}>
      <Text style={{ color: colors.textPrimary, fontSize: typography.size.xxl, fontWeight: typography.weight.bold }}>
        {user?.name ?? 'Profile'}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginTop: spacing.xs }}>
        {user?.email}
      </Text>

      <Button
        title="Log out"
        variant="danger"
        onPress={() => setConfirmVisible(true)}
        style={{ marginTop: spacing.xxl }}
      />

      <ConfirmDialog
        visible={confirmVisible}
        title="Log out?"
        message="You'll need to sign back in to start or check in on a journey."
        confirmLabel="Log out"
        destructive
        onConfirm={handleLogout}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
}
