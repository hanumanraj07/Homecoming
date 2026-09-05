import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReadyPulse, CategoryBadge } from '../Illustrations';
import { calculateCheckInInterval, formatDuration, formatDistance, RouteSummary, TransportMode } from '../../services/routing';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme/colors';

const MODE_LABELS: Record<TransportMode, string> = {
  walking: 'Walking',
  driving: 'Driving',
  cycling: 'Cycling',
  bus: 'Bus',
};

export function StepReview({
  name,
  destinationLabel,
  transportMode,
  route,
  contacts,
  selectedContactIds,
  isStarting,
  onEditDestination,
  onEditRoute,
  onEditContacts,
  onSaveTemplate,
  onStart,
}: {
  name: string;
  destinationLabel: string;
  transportMode: TransportMode;
  route: RouteSummary;
  contacts: any[];
  selectedContactIds: Set<string>;
  isStarting: boolean;
  onEditDestination: () => void;
  onEditRoute: () => void;
  onEditContacts: () => void;
  onSaveTemplate: () => void;
  onStart: () => void;
}) {
  const selectedContacts = contacts.filter((c) => selectedContactIds.has(c._id));

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.illustration}>
          <ReadyPulse size={130} />
        </View>

        <Text style={styles.title}>Ready when you are</Text>
        <Text style={styles.subtitle}>Double-check the details, then start your journey.</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.journeyName}>{name}</Text>
            <TouchableOpacity onPress={onEditDestination} hitSlop={8}>
              <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Ionicons name="navigate-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.rowText} numberOfLines={2}>{destinationLabel}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Route</Text>
            <TouchableOpacity onPress={onEditRoute} hitSlop={8}>
              <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <CategoryBadge type={transportMode} size={32} />
            <Text style={styles.rowText}>
              {MODE_LABELS[transportMode]} · {formatDuration(route.durationMinutes)} · {formatDistance(route.distanceMeters)}
            </Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.rowText}>Check in every {calculateCheckInInterval(route.durationMinutes)} min</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Contacts</Text>
            <TouchableOpacity onPress={onEditContacts} hitSlop={8}>
              <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          {selectedContacts.length === 0 ? (
            <Text style={styles.rowTextMuted}>No contacts selected — no one will be notified.</Text>
          ) : (
            selectedContacts.map((c) => (
              <View key={c._id} style={styles.row}>
                <Ionicons name="person-circle-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.rowText}>{c.name}</Text>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.saveTemplateButton} onPress={onSaveTemplate}>
          <Ionicons name="bookmark-outline" size={16} color={COLORS.primary} />
          <Text style={styles.saveTemplateText}>Save as Template</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={onStart} disabled={isStarting}>
          {isStarting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="navigate" size={20} color="white" />
              <Text style={styles.startButtonText}>Start Journey</Text>
            </>
          )}
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
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  journeyName: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  rowText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  rowTextMuted: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  saveTemplateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    gap: SPACING.sm,
  },
  saveTemplateText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: FONTS.semiBold,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    height: 56,
  },
  startButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: FONTS.bold,
  },
});
