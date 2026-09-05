import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loadNotificationSettings, saveNotificationSettings, NotificationSettings } from '../../services/settings';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme/colors';

export default function NotificationsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>({
    missedCheckInAlerts: true,
    lowBatteryWarnings: true,
  });

  useEffect(() => {
    loadNotificationSettings().then(setSettings);
  }, []);

  const toggle = (key: keyof NotificationSettings) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    saveNotificationSettings(next);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>During a Journey</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Missed Check-in Alerts</Text>
              <Text style={styles.rowSub}>Show a countdown and auto-escalate if you don't check in on time.</Text>
            </View>
            <Switch
              value={settings.missedCheckInAlerts}
              onValueChange={() => toggle('missedCheckInAlerts')}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="white"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="battery-half-outline" size={20} color={COLORS.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Low Battery Warnings</Text>
              <Text style={styles.rowSub}>Prompt to notify your contacts when your battery gets low.</Text>
            </View>
            <Switch
              value={settings.lowBatteryWarnings}
              onValueChange={() => toggle('lowBatteryWarnings')}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="white"
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.infoText}>
            These control in-app alerts during an active journey on this device. The Emergency button and manual "I'm Safe" check-in are never affected.
          </Text>
        </View>
      </View>
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
  content: { padding: SPACING.lg },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  rowSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.md + 40 + SPACING.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
});
