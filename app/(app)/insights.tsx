import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, ActivityIndicator, Animated, Easing, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { AscendingChart, CategoryBadge, RouteEmptyState } from '../../components/Illustrations';
import { useCountUp } from '../../hooks/useCountUp';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme/colors';

type Journey = {
  _id: string;
  status: string;
  transportMode?: string;
  estimatedDuration?: number;
  startTime?: string;
  actualArrival?: string;
  createdAt: string;
};

function journeyMinutes(j: Journey): number {
  if (j.startTime && j.actualArrival) {
    const diff = (new Date(j.actualArrival).getTime() - new Date(j.startTime).getTime()) / 60000;
    if (diff > 0) return Math.round(diff);
  }
  return j.estimatedDuration || 0;
}

function StatCard({ icon, label, value, suffix }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number; suffix?: string }) {
  const count = useCountUp(value);
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
      <Text style={styles.statValue}>
        {count}
        {suffix || ''}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BarChart({ journeys }: { journeys: Journey[] }) {
  const recent = journeys.slice(0, 7).reverse();
  const maxMinutes = Math.max(1, ...recent.map(journeyMinutes));
  const anims = useRef(recent.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      90,
      anims.map((a) => Animated.timing(a, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false }))
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeys.length]);

  if (recent.length === 0) return null;

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Recent Trip Duration</Text>
      <View style={styles.barRow}>
        {recent.map((j, i) => {
          const minutes = journeyMinutes(j);
          const heightPct = Math.max(0.08, minutes / maxMinutes);
          const animHeight = anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, heightPct * 100] });
          return (
            <View key={j._id} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      height: animHeight.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                      backgroundColor: j.status === 'COMPLETED' ? COLORS.primary : COLORS.warning,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{minutes}m</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function InsightsScreen() {
  const router = useRouter();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJourneys = useCallback(async () => {
    try {
      const response = await api.get('/journeys');
      if (response.data.success) setJourneys(response.data.data);
    } catch (error) {
      console.error('Failed to fetch insights data', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchJourneys();
    }, [fetchJourneys])
  );

  const completed = journeys.filter((j) => j.status === 'COMPLETED');
  const escalated = journeys.filter((j) => j.status === 'ESCALATED');
  const totalMinutes = completed.reduce((sum, j) => sum + journeyMinutes(j), 0);

  const modeCounts: Record<string, number> = {};
  journeys.forEach((j) => {
    const mode = j.transportMode || 'walking';
    modeCounts[mode] = (modeCounts[mode] || 0) + 1;
  });
  const topMode = (Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as any) || 'walking';

  // Longest current run of COMPLETED journeys, counted from the most recent one back — breaks on
  // the first ESCALATED/CANCELLED. ACTIVE/PLANNED entries (no outcome yet) don't count either way.
  let streak = 0;
  for (const j of journeys) {
    if (j.status === 'COMPLETED') streak++;
    else if (j.status === 'ACTIVE' || j.status === 'PLANNED' || j.status === 'CHECK-IN_PENDING') continue;
    else break;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insights</Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : journeys.length === 0 ? (
        <View style={styles.emptyContainer}>
          <RouteEmptyState height={150} />
          <Text style={styles.emptyTitle}>No insights yet</Text>
          <Text style={styles.emptySubtitle}>Complete a journey and your stats will start showing up here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <AscendingChart width={160} height={90} />
            <View style={{ flex: 1 }}>
              <Text style={styles.streakValue}>{streak}</Text>
              <Text style={styles.streakLabel}>journey{streak === 1 ? '' : 's'} completed safely in a row</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatCard icon="navigate-outline" label="Total Journeys" value={journeys.length} />
            <StatCard icon="checkmark-circle-outline" label="Completed" value={completed.length} />
            <StatCard icon="time-outline" label="Minutes Traveled" value={totalMinutes} />
            <StatCard icon="warning-outline" label="Emergencies Sent" value={escalated.length} />
          </View>

          <BarChart journeys={journeys} />

          <View style={styles.modeCard}>
            <CategoryBadge type={topMode} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={styles.modeTitle}>Most Used Mode</Text>
              <Text style={styles.modeValue}>{topMode.charAt(0).toUpperCase() + topMode.slice(1)}</Text>
            </View>
          </View>

          {escalated.length > 0 && (
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.infoText}>
                "Minutes Traveled" counts completed journeys only, using actual arrival time where available.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  streakValue: {
    fontSize: 34,
    fontWeight: FONTS.extraBold,
    color: COLORS.textPrimary,
  },
  streakLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: FONTS.extraBold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  chartCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: FONTS.semiBold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 110,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 16,
    height: 84,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 16,
    borderRadius: 8,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  modeTitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modeValue: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
