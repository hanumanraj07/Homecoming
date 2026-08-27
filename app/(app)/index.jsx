import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { EmptyState } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const QUICK_ACTIONS = [
  { icon: '🧭', label: 'New journey', href: '/journey/new' },
  { icon: '🛡️', label: 'Guardians', href: '/guardians' },
  { icon: '🗺️', label: 'Map', href: '/map' },
  { icon: '📞', label: 'Fake call', href: '/fake-call' },
];

function QuickAction({ icon, label, onPress }) {
  const { colors, spacing, radii, typography, shadows } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        shadows.sm,
        {
          flexBasis: '47%',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: spacing.lg,
          borderRadius: radii.lg,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
          minHeight: 44,
        },
      ]}
    >
      <Text style={{ fontSize: typography.size.xl }}>{icon}</Text>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.size.sm,
          fontWeight: typography.weight.medium,
          marginTop: spacing.xs,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { colors, spacing, typography } = useTheme();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.size.xxl,
          fontWeight: typography.weight.bold,
          marginBottom: spacing.lg,
        }}
      >
        Hi, {firstName}
      </Text>

      <EmptyState
        icon={<Text style={{ fontSize: 40 }}>🧭</Text>}
        title="No active journey"
        message="Start one before you head out so your guardians know where you are."
        actionLabel="Start a journey"
        onAction={() => router.push('/journey/new')}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: spacing.xl,
        }}
      />

      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.size.sm,
          fontWeight: typography.weight.semibold,
          marginBottom: spacing.md,
        }}
      >
        QUICK ACTIONS
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md }}>
        {QUICK_ACTIONS.map((action) => (
          <QuickAction key={action.href} icon={action.icon} label={action.label} onPress={() => router.push(action.href)} />
        ))}
      </View>
    </ScrollView>
  );
}
