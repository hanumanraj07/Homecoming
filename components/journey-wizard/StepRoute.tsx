import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoutePathReveal, CategoryBadge } from '../Illustrations';
import { fetchRouteAlternatives, calculateCheckInInterval, formatDuration, formatDistance, RouteSummary, TransportMode } from '../../services/routing';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme/colors';

const MODES: { value: TransportMode; label: string }[] = [
  { value: 'walking', label: 'Walk' },
  { value: 'driving', label: 'Drive' },
  { value: 'cycling', label: 'Cycle' },
  { value: 'bus', label: 'Bus' },
];

const ROUTE_LABELS = ['Fastest Route', 'Alternate Route', 'Alternate Route 2'];

export function StepRoute({
  origin,
  destination,
  transportMode,
  selectedRoute,
  onChangeMode,
  onSelectRoute,
  onNext,
}: {
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  transportMode: TransportMode;
  selectedRoute: RouteSummary | null;
  onChangeMode: (mode: TransportMode) => void;
  onSelectRoute: (route: RouteSummary) => void;
  onNext: () => void;
}) {
  const [options, setOptions] = useState<RouteSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    fetchRouteAlternatives(origin, destination, transportMode).then((results) => {
      if (requestIdRef.current !== requestId) return;
      setOptions(results);
      onSelectRoute(results[0]);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transportMode]);

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.illustration}>
          <RoutePathReveal width={280} height={150} mode={transportMode} />
        </View>

        <Text style={styles.title}>How are you getting there?</Text>
        <Text style={styles.subtitle}>Pick a mode of transport, then a route.</Text>

        <View style={styles.modeRow}>
          {MODES.map((mode) => {
            const active = transportMode === mode.value;
            return (
              <TouchableOpacity
                key={mode.value}
                style={styles.modeItem}
                onPress={() => onChangeMode(mode.value)}
                activeOpacity={0.8}
              >
                <View style={[styles.badgeWrap, active && styles.badgeWrapActive]}>
                  <CategoryBadge type={mode.value} size={48} />
                </View>
                <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{mode.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {transportMode === 'bus' && (
          <View style={styles.noteBox}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.noteText}>
              Estimated using the road route — live bus schedules aren't available.
            </Text>
          </View>
        )}

        <Text style={styles.label}>Choose a Route</Text>
        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.noteText}>Finding routes…</Text>
          </View>
        ) : (
          options.map((option, index) => {
            const isSelected = selectedRoute === option;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.routeCard, isSelected && styles.routeCardSelected]}
                onPress={() => onSelectRoute(option)}
              >
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeCardTitle}>
                    {options.length > 1 ? ROUTE_LABELS[index] || `Route ${index + 1}` : 'Route'}
                  </Text>
                  <Text style={styles.routeCardSub}>
                    {formatDuration(option.durationMinutes)} · {formatDistance(option.distanceMeters)}
                    {option.isApproximate ? ' · approximate' : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {selectedRoute && !isLoading && (
          <View style={styles.checkInNote}>
            <Ionicons name="time-outline" size={16} color={COLORS.primary} />
            <Text style={styles.noteText}>
              We'll check in with you every {calculateCheckInInterval(selectedRoute.durationMinutes)} min during the trip.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, (!selectedRoute || isLoading) && styles.nextButtonDisabled]}
          onPress={onNext}
          disabled={!selectedRoute || isLoading}
        >
          <Text style={styles.nextButtonText}>Confirm Route</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollFlex: { flex: 1 },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  illustration: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: FONTS.extraBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modeItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  badgeWrap: {
    borderRadius: RADIUS.full,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  badgeWrapActive: {
    borderColor: COLORS.accent,
  },
  modeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  modeLabelActive: {
    color: COLORS.accentDark,
    fontWeight: FONTS.semiBold,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  routeCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.tintOrange + '40',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  routeCardTitle: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  routeCardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checkInNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    height: 54,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: FONTS.bold,
  },
});
