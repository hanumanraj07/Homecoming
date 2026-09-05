import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../../services/api';
import { CategoryBadge, RouteEmptyState } from '../../../components/Illustrations';
import { HamburgerMenu } from '../../../components/HamburgerMenu';
import { COLORS, FONTS, RADIUS, SPACING } from '../../../theme/colors';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: COLORS.primary,
  SAFE: COLORS.success,
  COMPLETED: COLORS.success,
  'CHECK-IN_MISSED': COLORS.warning,
  ESCALATED: COLORS.danger,
  CANCELLED: COLORS.textMuted,
  PLANNED: COLORS.textMuted,
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function JourneysScreen() {
  const router = useRouter();
  const [journeys, setJourneys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchJourneys = useCallback(async () => {
    try {
      const response = await api.get('/journeys');
      if (response.data.success) {
        setJourneys(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch journeys', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Refetch every time this tab comes into focus (not just on first mount) — a journey started
  // from Home should show up here, and a journey's status should stay current after visiting it.
  useFocusEffect(
    useCallback(() => {
      fetchJourneys();
    }, [fetchJourneys])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchJourneys();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Journey History</Text>
          <HamburgerMenu />
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : journeys.length === 0 ? (
          <View style={styles.emptyContainer}>
            <RouteEmptyState height={150} />
            <Text style={styles.emptyTitle}>No journeys yet</Text>
            <Text style={styles.emptySubtitle}>
              Your past journeys will appear here. Start a journey from the Home tab.
            </Text>
          </View>
        ) : (
          journeys.map((journey) => {
            const statusColor = STATUS_COLOR[journey.status] || COLORS.textMuted;
            return (
              <TouchableOpacity
                key={journey._id}
                style={styles.journeyCard}
                onPress={() => router.push(`/(app)/journey/${journey._id}` as any)}
                activeOpacity={0.8}
              >
                <CategoryBadge type={journey.transportMode || 'walking'} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.journeyName} numberOfLines={1}>{journey.name}</Text>
                  <Text style={styles.journeyDest} numberOfLines={1}>
                    → {journey.destination?.address || 'Unknown destination'}
                  </Text>
                  <Text style={styles.journeyDate}>{formatDate(journey.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { borderColor: statusColor + '50', backgroundColor: statusColor + '25' }]}>
                  <Text style={[styles.statusBadgeText, { color: statusColor }]}>{journey.status}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    flexGrow: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  centered: {
    paddingTop: SPACING.xxl * 2,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl * 2,
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
    lineHeight: 22,
    paddingHorizontal: SPACING.xl,
  },
  journeyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  journeyName: {
    fontSize: 15,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  journeyDest: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  journeyDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: FONTS.semiBold,
  },
});
