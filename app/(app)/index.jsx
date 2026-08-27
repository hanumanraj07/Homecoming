import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Badge, EmptyState } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCountdown } from '../../hooks/useCountdown';
import { listJourneys } from '../../services/journeys';

const QUICK_ACTIONS = [
  { icon: '🧭', label: 'New journey', href: '/journey/new' },
  { icon: '🛡️', label: 'Guardians', href: '/guardians' },
  { icon: '🗺️', label: 'Map', href: '/map' },
  { icon: '📞', label: 'Fake call', href: '/fake-call' },
];

const STATUS_LABEL = { active: 'Active', completed: 'Completed', missed: 'Missed', sos: 'SOS' };
const STATUS_VARIANT = { active: 'primary', completed: 'success', missed: 'warning', sos: 'danger' };

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

function ActiveJourneyCard({ journey }) {
  const { colors, spacing, radii, typography, shadows } = useTheme();
  const countdown = useCountdown(journey.checkInDeadline);

  return (
    <Pressable
      onPress={() => router.push(`/journey/${journey._id}`)}
      accessibilityRole="button"
      accessibilityLabel="Active journey"
      style={({ pressed }) => [
        shadows.sm,
        {
          backgroundColor: colors.primarySoft,
          borderRadius: radii.lg,
          padding: spacing.lg,
          marginBottom: spacing.xl,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.primary, fontSize: typography.size.xs, fontWeight: typography.weight.semibold }}>
          JOURNEY IN PROGRESS
        </Text>
        <Badge label="Active" variant="primary" size="sm" />
      </View>
      <Text style={{ color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.bold, marginTop: spacing.xs }}>
        {journey.destination.address || 'Destination'}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginTop: 2 }}>
        {countdown.isOverdue ? 'Check-in overdue' : `Check in within ${countdown.label}`}
      </Text>
    </Pressable>
  );
}

function JourneyHistoryRow({ journey }) {
  const { colors, spacing, typography } = useTheme();
  const date = new Date(journey.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <Pressable
      onPress={() => router.push(`/journey/${journey._id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Journey to ${journey.destination.address}`}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <View style={{ flex: 1, marginRight: spacing.sm }}>
        <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }} numberOfLines={1}>
          {journey.destination.address || 'Destination'}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs, marginTop: 2 }}>{date}</Text>
      </View>
      <Badge label={STATUS_LABEL[journey.status]} variant={STATUS_VARIANT[journey.status]} size="sm" />
    </Pressable>
  );
}

export default function HomeScreen() {
  const { colors, spacing, typography } = useTheme();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const [journeys, setJourneys] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchJourneys = useCallback(async () => {
    try {
      const data = await listJourneys();
      setJourneys(data);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    fetchJourneys();
  }, [fetchJourneys]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchJourneys();
    setIsRefreshing(false);
  };

  const activeJourney = journeys.find((journey) => journey.status === 'active');
  const historyJourneys = journeys.filter((journey) => journey.status !== 'active');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg }}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
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

      {loadState === 'loading' ? (
        <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : loadState === 'error' ? (
        <EmptyState
          icon={<Text style={{ fontSize: 40 }}>⚠️</Text>}
          title="Couldn't load your journeys"
          message="Pull down to try again."
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: spacing.xl,
          }}
        />
      ) : activeJourney ? (
        <ActiveJourneyCard journey={activeJourney} />
      ) : (
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
      )}

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
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md, marginBottom: spacing.xl }}>
        {QUICK_ACTIONS.map((action) => (
          <QuickAction key={action.href} icon={action.icon} label={action.label} onPress={() => router.push(action.href)} />
        ))}
      </View>

      {historyJourneys.length > 0 ? (
        <>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold,
              marginBottom: spacing.sm,
            }}
          >
            RECENT JOURNEYS
          </Text>
          {historyJourneys.map((journey) => (
            <JourneyHistoryRow key={journey._id} journey={journey} />
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}
