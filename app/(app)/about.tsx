import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HeroScene } from '../../components/Illustrations';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme/colors';

const FEATURES = [
  { icon: 'navigate-outline', text: 'Animated journey planner with route and mode selection' },
  { icon: 'time-outline', text: 'Automatic missed check-in detection and escalation' },
  { icon: 'warning-outline', text: 'One-tap emergency alerts to your trusted contacts' },
  { icon: 'shield-outline', text: 'Standalone SOS from the Safety tab, no journey required' },
  { icon: 'stats-chart-outline', text: 'Insights into your journey history and safety streaks' },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Homecoming</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.illustration}>
          <HeroScene height={180} showHouse={false} />
        </View>

        <Text style={styles.appName}>Homecoming</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.description}>
          Homecoming helps you share your journey with the people who care about you, and lets them know the moment you're home safe.
        </Text>

        <Text style={styles.sectionLabel}>What's Inside</Text>
        <View style={styles.card}>
          {FEATURES.map((f, i) => (
            <View key={f.text} style={[styles.row, i < FEATURES.length - 1 && styles.rowDivider]}>
              <Ionicons name={f.icon as any} size={18} color={COLORS.primary} />
              <Text style={styles.rowText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Built with React Native and Expo.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
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
  headerTitle: { fontSize: 17, fontWeight: FONTS.bold, color: COLORS.textPrimary },
  scroll: { paddingBottom: SPACING.xxl, alignItems: 'center' },
  illustration: {
    width: '100%',
    height: 180,
    marginBottom: SPACING.lg,
  },
  appName: {
    fontSize: 24,
    fontWeight: FONTS.extraBold,
    color: COLORS.textPrimary,
  },
  version: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    marginLeft: SPACING.lg,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  card: {
    alignSelf: 'stretch',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  footer: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xl,
  },
});
