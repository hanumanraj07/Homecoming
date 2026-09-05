import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Share, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as Battery from 'expo-battery';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';
import { PulseRings } from '../../../components/Illustrations';
import { HamburgerMenu } from '../../../components/HamburgerMenu';
import { COLORS, FONTS, RADIUS, SPACING } from '../../../theme/colors';

export default function SafetyScreen() {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [contactCount, setContactCount] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<Location.PermissionStatus | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const response = await api.get('/contacts');
      if (response.data.success) setContactCount(response.data.data.length);
    } catch (err) {
      console.error('Failed to load contacts for safety status', err);
    }
    const loc = await Location.getForegroundPermissionsAsync();
    setLocationStatus(loc.status);
    try {
      const level = await Battery.getBatteryLevelAsync();
      setBatteryLevel(level);
    } catch {
      setBatteryLevel(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshStatus();
    }, [refreshStatus])
  );

  // A standalone SOS — unlike the Emergency button on an active journey, this works any time,
  // with no journey required. It's the "something's wrong right now" button.
  const handleSos = () => {
    Alert.alert(
      'Send SOS',
      'This opens your Messages app pre-filled to alert your trusted contacts with your current location. You still need to tap Send.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'destructive', onPress: sendSos },
      ]
    );
  };

  const sendSos = async () => {
    setIsSending(true);
    try {
      const contactsResponse = await api.get('/contacts');
      const phoneNumbers = (contactsResponse.data.data || [])
        .map((c: any) => c.phone)
        .filter(Boolean);

      if (phoneNumbers.length === 0) {
        Alert.alert('No Trusted Contacts', 'Add a trusted contact first so there\'s someone to alert.');
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      let mapsLink = 'location unavailable';
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        mapsLink = `https://www.google.com/maps?q=${loc.coords.latitude},${loc.coords.longitude}`;
      }

      const isSmsAvailable = await SMS.isAvailableAsync();
      if (!isSmsAvailable) {
        Alert.alert('SMS Not Available', "This device can't send text messages (common on simulators).");
        return;
      }

      await SMS.sendSMSAsync(phoneNumbers, `SOS: I need help. My last known location: ${mapsLink}`);
    } catch (err) {
      console.error('Failed to send SOS', err);
      Alert.alert('Error', 'Failed to send SOS.');
    } finally {
      setIsSending(false);
    }
  };

  const handleShareLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Location permission is required to share your location.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    const mapsLink = `https://www.google.com/maps?q=${loc.coords.latitude},${loc.coords.longitude}`;
    try {
      await Share.share({ message: `Here's my current location: ${mapsLink}` });
    } catch (err) {
      console.error('Failed to share location', err);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Safety Center</Text>
          <HamburgerMenu />
        </View>
        <Text style={styles.pageSubtitle}>Quick tools for when you need them — no active journey required.</Text>

        <View style={styles.sosWrap}>
          <PulseRings size={190} color={COLORS.danger} />
          <TouchableOpacity style={styles.sosButton} onPress={handleSos} disabled={isSending} activeOpacity={0.85}>
            {isSending ? (
              <ActivityIndicator color="white" size="large" />
            ) : (
              <>
                <Ionicons name="warning" size={30} color="white" />
                <Text style={styles.sosText}>SOS</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.sosHint}>Tap to alert your trusted contacts right now</Text>

        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/fake-call')} activeOpacity={0.85}>
            <Ionicons name="call" size={22} color={COLORS.accentDark} />
            <Text style={styles.quickLabel}>Fake Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={handleShareLocation} activeOpacity={0.85}>
            <Ionicons name="location" size={22} color={COLORS.primary} />
            <Text style={styles.quickLabel}>Share Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(app)/(tabs)/contacts')} activeOpacity={0.85}>
            <Ionicons name="people" size={22} color={COLORS.warning} />
            <Text style={styles.quickLabel}>Contacts</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Readiness Check</Text>
        <View style={styles.statusList}>
          <StatusRow
            icon="people-outline"
            label="Trusted Contacts"
            value={contactCount === null ? '…' : `${contactCount} added`}
            ok={contactCount !== null && contactCount > 0}
          />
          <StatusRow
            icon="location-outline"
            label="Location Permission"
            value={locationStatus === 'granted' ? 'Granted' : locationStatus === null ? '…' : 'Not granted'}
            ok={locationStatus === 'granted'}
          />
          <StatusRow
            icon="battery-half-outline"
            label="Battery Level"
            value={batteryLevel === null ? 'Unknown' : `${Math.round(batteryLevel * 100)}%`}
            ok={batteryLevel === null ? true : batteryLevel > 0.15}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function StatusRow({
  icon,
  label,
  value,
  ok,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <View style={styles.statusRow}>
      <Ionicons name={icon} size={18} color={COLORS.textMuted} />
      <Text style={styles.statusLabel}>{label}</Text>
      <View style={[styles.statusBadge, ok ? styles.statusBadgeOk : styles.statusBadgeWarn]}>
        <Text style={[styles.statusBadgeText, { color: ok ? COLORS.success : COLORS.warning }]}>{value}</Text>
      </View>
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
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  pageSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: SPACING.xl,
  },
  sosWrap: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  sosText: {
    color: 'white',
    fontSize: 20,
    fontWeight: FONTS.extraBold,
    letterSpacing: 1,
    marginTop: 2,
  },
  sosHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  quickRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  quickCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: 6,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  statusList: {
    width: '100%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: FONTS.medium,
  },
  statusBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  statusBadgeOk: {
    backgroundColor: COLORS.success + '18',
  },
  statusBadgeWarn: {
    backgroundColor: COLORS.warning + '18',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
  },
});
