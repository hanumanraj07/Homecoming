import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Card, ConfirmDialog, ListItem } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

function Avatar({ name }) {
  const { colors, typography } = useTheme();
  const initials = (name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: colors.primary, fontSize: typography.size.xl, fontWeight: typography.weight.bold }}>
        {initials}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { colors, spacing, typography } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleLogout = async () => {
    setConfirmVisible(false);
    await logout();
    showToast('Logged out', 'success');
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl }}>
        <Avatar name={user?.name} />
        <View style={{ marginLeft: spacing.md }}>
          <Text style={{ color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.bold }}>
            {user?.name ?? 'Profile'}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginTop: 2 }}>{user?.email}</Text>
        </View>
      </View>

      <Card padded={false}>
        <ListItem title="Email" subtitle={user?.email ?? '—'} />
        <ListItem title="Phone" subtitle={user?.phone ?? '—'} />
      </Card>

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
