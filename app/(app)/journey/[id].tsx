import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Modal,
  Share,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as Battery from 'expo-battery';
import { startBackgroundLocationTracking, stopBackgroundLocationTracking } from '../../../services/backgroundLocation';
import { api } from '../../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { CategoryBadge, JourneyCompleteScene } from '../../../components/Illustrations';
import { fetchRouteSummary, RouteCoordinate } from '../../../services/routing';
import { COLORS, FONTS, RADIUS, SPACING } from '../../../theme/colors';

const MISSED_CHECKIN_COUNTDOWN_SECONDS = 30;
const LOW_BATTERY_THRESHOLD = 0.15;

function formatTime(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ActiveJourneyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [journey, setJourney] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<RouteCoordinate[]>([]);
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const [missedCheckInVisible, setMissedCheckInVisible] = useState(false);
  const [countdown, setCountdown] = useState(MISSED_CHECKIN_COUNTDOWN_SECONDS);
  const missedCheckInHandledForRef = useRef<string | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasWarnedLowBatteryRef = useRef(false);
  const [showCompleteCelebration, setShowCompleteCelebration] = useState(false);
  const celebrationTextAnim = useRef(new Animated.Value(0)).current;

  const isActive = journey?.status === 'ACTIVE';

  useEffect(() => {
    // Prevent eager loading if ID is not a valid MongoDB ObjectId
    if (!id || typeof id !== 'string' || id.length !== 24) return;
    fetchJourney();
  }, [id]);

  const fetchJourney = async () => {
    try {
      const response = await api.get(`/journeys/${id}`);
      setJourney(response.data.data);
    } catch (error: any) {
      console.error(error);
      // A 401 means the session expired and the user is being sent back to login (see
      // services/api.ts's unauthorized handler) — that's explanation enough on its own.
      if (error?.response?.status !== 401) {
        Alert.alert('Error', 'Could not load journey details');
      }
    }
  };

  // Only track location (and drain battery posting updates) while the journey is actually
  // active — a completed/cancelled journey has no reason to keep watching position.
  useEffect(() => {
    if (!isActive || !id || typeof id !== 'string') return;

    let cancelled = false;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      locationSubscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 10 },
        (loc) => {
          setCurrentLocation(loc);
          updateLocationOnServer(loc);
        }
      );

      // Best-effort — keeps tracking going if the app is backgrounded on a real device build.
      // Safe to call even in Expo Go (it warns rather than throwing there; see
      // services/backgroundLocation.ts for why it may not actually deliver updates there).
      startBackgroundLocationTracking(id);
    })();

    return () => {
      cancelled = true;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
      stopBackgroundLocationTracking();
    };
  }, [isActive, id]);

  const updateLocationOnServer = async (loc: Location.LocationObject) => {
    try {
      await api.post(`/journeys/${id}/location`, {
        location: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy,
          speed: loc.coords.speed,
          heading: loc.coords.heading,
        },
      });
    } catch (error) {
      console.error('Failed to update location to server', error);
    }
  };

  const handleImSafe = async () => {
    try {
      await api.post(`/journeys/${id}/check-in`, {
        status: 'SAFE',
        location: currentLocation ? {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
        } : null,
      });
      dismissMissedCheckIn();
      Alert.alert('Checked In', 'Your trusted contacts have been updated.');
      fetchJourney();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEndJourney = () => {
    Alert.alert(
      'End Journey',
      'Have you reached your destination safely?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, End Journey',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/journeys/${id}/end`);
              // Hold on this screen for the completion celebration before leaving — the API
              // call already succeeded, so this is purely a "you made it" moment, not a wait.
              setShowCompleteCelebration(true);
              setTimeout(() => {
                router.replace('/(app)/(tabs)');
              }, 3200);
            } catch (error) {
              console.error(error);
            }
          },
        },
      ]
    );
  };

  // The actual alert-sending action, shared by the manual Emergency button (after a confirm
  // dialog) and the missed-check-in auto-timeout (which skips confirmation — the countdown
  // banner the user could've dismissed *was* the confirmation window).
  const sendEmergencyAlert = async () => {
    const phoneNumbers = ((journey?.trustedContacts || []) as any[])
      .map((contact) => contact.phone)
      .filter(Boolean);

    if (phoneNumbers.length === 0) {
      Alert.alert(
        'No Trusted Contacts',
        'This journey has no trusted contacts attached, so there’s no one to message. Pick contacts next time you start a journey.'
      );
      return;
    }

    try {
      // Record the escalation server-side regardless of whether the SMS below actually gets
      // sent (the compose UI still requires the user to tap Send) — the status change and
      // location are still useful history even if the text is never sent.
      await api.post(`/journeys/${id}/emergency`, {
        location: currentLocation ? {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        } : null,
      });
      fetchJourney();

      const isSmsAvailable = await SMS.isAvailableAsync();
      if (!isSmsAvailable) {
        Alert.alert(
          'SMS Not Available',
          'This device can’t send text messages (common on simulators). The emergency was still recorded.'
        );
        return;
      }

      const mapsLink = currentLocation
        ? `https://www.google.com/maps?q=${currentLocation.coords.latitude},${currentLocation.coords.longitude}`
        : 'location unavailable';
      const message = `EMERGENCY: I need help during my journey "${journey.name}". My last known location: ${mapsLink}`;

      await SMS.sendSMSAsync(phoneNumbers, message);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send emergency alert');
    }
  };

  const handleEmergency = () => {
    const contacts = (journey?.trustedContacts || []) as any[];
    const contactCount = contacts.filter((c) => c.phone).length;

    if (contactCount === 0) {
      Alert.alert(
        'No Trusted Contacts',
        'This journey has no trusted contacts attached, so there’s no one to message. Pick contacts next time you start a journey.'
      );
      return;
    }

    const priorityContact = contacts.find((c) => c.isPriority && c.phone);

    const buttons: any[] = [{ text: 'Cancel', style: 'cancel' }];
    if (priorityContact) {
      buttons.push({
        text: `Call ${priorityContact.name}`,
        onPress: () => Linking.openURL(`tel:${priorityContact.phone}`),
      });
    }
    buttons.push({ text: 'SEND EMERGENCY ALERT', style: 'destructive', onPress: sendEmergencyAlert });

    Alert.alert(
      'EMERGENCY',
      `This opens your Messages app pre-filled to alert ${contactCount} trusted contact${contactCount > 1 ? 's' : ''} with your current location. You'll need to tap Send in the Messages app to actually send it.`,
      buttons
    );
  };

  // --- Missed check-in detection ---
  // Polls locally while the journey is active. Each cycle, `journey.checkInInterval +
  // journey.gracePeriod` minutes after `lastCheckIn`, a countdown banner appears; ignoring it
  // auto-fires the same emergency SMS flow as the manual button. `missedCheckInHandledForRef`
  // is keyed on the current `lastCheckIn` timestamp so a fresh check-in (which changes that
  // timestamp) naturally re-arms detection for the *next* interval instead of re-firing
  // immediately or never firing again for the rest of the journey.
  useEffect(() => {
    if (!isActive || !journey?.lastCheckIn || !journey?.checkInInterval) return;

    const check = () => {
      const deadline =
        new Date(journey.lastCheckIn).getTime() +
        (journey.checkInInterval + (journey.gracePeriod || 0)) * 60000;
      const isOverdue = Date.now() > deadline;
      const alreadyHandled = missedCheckInHandledForRef.current === journey.lastCheckIn;

      if (isOverdue && !alreadyHandled && !missedCheckInVisible) {
        missedCheckInHandledForRef.current = journey.lastCheckIn;
        setCountdown(MISSED_CHECKIN_COUNTDOWN_SECONDS);
        setMissedCheckInVisible(true);
      }
    };

    check();
    const poll = setInterval(check, 15000);
    return () => clearInterval(poll);
  }, [isActive, journey?.lastCheckIn, journey?.checkInInterval, journey?.gracePeriod, missedCheckInVisible]);

  useEffect(() => {
    if (!missedCheckInVisible) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          setMissedCheckInVisible(false);
          sendEmergencyAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missedCheckInVisible]);

  const dismissMissedCheckIn = () => {
    setMissedCheckInVisible(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  // --- Low battery warning ---
  // expo-sms can't send silently, so this can't proactively text contacts on its own — it warns
  // the user (whose battery it actually is) with a one-tap way to let contacts know tracking
  // might stop soon, same tap-to-send pattern as the Emergency button.
  useEffect(() => {
    if (!isActive) return;

    const sub = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      if (batteryLevel <= LOW_BATTERY_THRESHOLD && !hasWarnedLowBatteryRef.current) {
        hasWarnedLowBatteryRef.current = true;
        Alert.alert(
          'Low Battery',
          `Your battery is at ${Math.round(batteryLevel * 100)}%. If it dies, location tracking will stop. Let your trusted contacts know?`,
          [
            { text: 'Not now', style: 'cancel' },
            {
              text: 'Notify Contacts',
              onPress: async () => {
                const phoneNumbers = ((journey?.trustedContacts || []) as any[])
                  .map((c) => c.phone)
                  .filter(Boolean);
                if (phoneNumbers.length === 0) return;
                const isSmsAvailable = await SMS.isAvailableAsync();
                if (!isSmsAvailable) return;
                await SMS.sendSMSAsync(
                  phoneNumbers,
                  `Heads up: my phone battery is low during my journey "${journey?.name}". Location tracking may stop soon.`
                );
              },
            },
          ]
        );
      }
    });

    return () => sub.remove();
  }, [isActive, journey?.name]);

  useEffect(() => {
    if (!showCompleteCelebration) return;
    celebrationTextAnim.setValue(0);
    Animated.timing(celebrationTextAnim, {
      toValue: 1,
      duration: 500,
      delay: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [showCompleteCelebration, celebrationTextAnim]);

  const handleShareLocation = async () => {
    if (!currentLocation) {
      Alert.alert('Location Not Ready', 'Still acquiring your location — try again in a moment.');
      return;
    }
    const mapsLink = `https://www.google.com/maps?q=${currentLocation.coords.latitude},${currentLocation.coords.longitude}`;
    try {
      await Share.share({
        message: `I'm on my way to ${journey?.destination?.address || 'my destination'}. Here's my current location: ${mapsLink}`,
      });
    } catch (error) {
      console.error('Failed to share location', error);
    }
  };

  const centerMap = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // Fetch the actual route once we know the journey's fixed starting point and destination.
  // Deliberately keyed off `startLocation` (recorded once, when the journey began) rather than
  // the continuously-updating `currentLocation` — the route line represents the planned path,
  // not something that should be re-requested from OSRM every 10s as you move.
  useEffect(() => {
    const origin = journey?.startLocation?.latitude
      ? { latitude: journey.startLocation.latitude, longitude: journey.startLocation.longitude }
      : currentLocation
      ? { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude }
      : null;
    const destination = journey?.destination?.latitude
      ? { latitude: journey.destination.latitude, longitude: journey.destination.longitude }
      : null;

    if (!origin || !destination || routeCoordinates.length > 0) return;

    fetchRouteSummary(origin, destination, journey?.transportMode || 'walking')
      .then((summary) => {
        setRouteCoordinates(summary.coordinates);
      })
      .catch((err) => {
        console.error('Failed to fetch route', err);
        setRouteCoordinates([origin, destination]);
      });
  }, [journey?.startLocation?.latitude, journey?.destination?.latitude, journey?.transportMode, currentLocation]);

  // Zoom/pan the map to fit the route once it's loaded — the tight 0.01 initial region is
  // centered on the current location alone and would otherwise leave a destination even a short
  // distance away off-screen. Deliberately only depends on `routeCoordinates`, not the
  // continuously-updating `currentLocation` — otherwise this would re-fit (and visually jitter,
  // undoing any manual zoom/pan) on every ~10s location tick while the journey is active.
  useEffect(() => {
    if (routeCoordinates.length === 0 || !mapRef.current) return;

    mapRef.current.fitToCoordinates(routeCoordinates, {
      edgePadding: { top: 80, right: 60, bottom: 260, left: 60 },
      animated: true,
    });
  }, [routeCoordinates]);

  if (!journey) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading journey...</Text>
      </View>
    );
  }

  const statusColors: Record<string, string> = {
    ACTIVE: COLORS.primary,
    SAFE: COLORS.success,
    COMPLETED: COLORS.success,
    'CHECK-IN_MISSED': COLORS.warning,
    ESCALATED: COLORS.danger,
    CANCELLED: COLORS.textMuted,
    PLANNED: COLORS.textMuted,
  };
  const statusColor = statusColors[journey.status] || COLORS.primary;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={isActive}
        userInterfaceStyle="dark"
        initialRegion={currentLocation ? {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        } : journey.destination?.latitude ? {
          latitude: journey.destination.latitude,
          longitude: journey.destination.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        } : undefined}
      >
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor={COLORS.primary} />
        )}
        {journey.startLocation?.latitude && (
          <Marker
            coordinate={{ latitude: journey.startLocation.latitude, longitude: journey.startLocation.longitude }}
            title="Start"
            pinColor="green"
          />
        )}
        {journey.destination?.latitude && (
          <Marker
            coordinate={{ latitude: journey.destination.latitude, longitude: journey.destination.longitude }}
            title="Destination"
            description={journey.destination.address}
            pinColor="red"
          />
        )}
      </MapView>

      {/* Back Button — this screen renders edge-to-edge with no native header, so this is the
          only way back; going back does not end an active journey, it just stops watching it
          from this screen (tracking/check-ins continue server-side). */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="arrow-back" size={20} color="white" />
      </TouchableOpacity>

      {/* Center Map Button */}
      {isActive && (
        <TouchableOpacity style={styles.centerButton} onPress={centerMap}>
          <Ionicons name="locate" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      )}

      {/* Missed Check-in Banner */}
      <Modal visible={missedCheckInVisible} transparent animationType="fade">
        <View style={styles.missedOverlay}>
          <View style={styles.missedCard}>
            <Ionicons name="warning" size={40} color={COLORS.danger} />
            <Text style={styles.missedTitle}>Missed Check-in</Text>
            <Text style={styles.missedSubtitle}>
              You didn't check in on time. If you don't respond, an emergency alert will be sent in
            </Text>
            <Text style={styles.missedCountdown}>{countdown}s</Text>
            <TouchableOpacity style={styles.safeButton} onPress={handleImSafe}>
              <Ionicons name="shield-checkmark" size={20} color="white" />
              <Text style={styles.safeButtonText}>I'M SAFE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.missedEmergencyButton}
              onPress={() => {
                dismissMissedCheckIn();
                sendEmergencyAlert();
              }}
            >
              <Text style={styles.missedEmergencyText}>Send Emergency Alert Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Sheet */}
      <ScrollView style={styles.bottomSheet} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 32 }}>

        {/* Journey Info */}
        <View style={styles.journeyHeader}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <CategoryBadge type={journey.transportMode || 'walking'} size={40} />
          <View style={{ flex: 1 }}>
            <View style={styles.journeyNameRow}>
              <Text style={styles.journeyName}>{journey.name}</Text>
            </View>
            <Text style={styles.journeyDest}>→ {journey.destination?.address || 'Unknown destination'}</Text>
          </View>
          <View style={[styles.statusBadge, { borderColor: statusColor + '50', backgroundColor: statusColor + '25' }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{journey.status}</Text>
          </View>
        </View>

        {isActive ? (
          <>
            {/* I'm Safe Button */}
            <TouchableOpacity style={styles.safeButton} onPress={handleImSafe} activeOpacity={0.85}>
              <Ionicons name="shield-checkmark" size={22} color="white" />
              <Text style={styles.safeButtonText}>I'M SAFE</Text>
            </TouchableOpacity>

            {/* Secondary Actions */}
            <View style={styles.secondaryRow}>
              <TouchableOpacity style={styles.endButton} onPress={handleEndJourney}>
                <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.textPrimary} />
                <Text style={styles.endButtonText}>End Journey</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergency}>
                <Ionicons name="warning" size={18} color="white" />
                <Text style={styles.emergencyButtonText}>EMERGENCY</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.shareButton} onPress={handleShareLocation}>
              <Ionicons name="share-social-outline" size={18} color={COLORS.primary} />
              <Text style={styles.shareButtonText}>Share Live Location</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Read-only summary for a completed/past journey */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>STARTED</Text>
                <Text style={styles.summaryValue}>{formatTime(journey.startTime)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{journey.status === 'COMPLETED' ? 'ARRIVED' : 'ENDED'}</Text>
                <Text style={styles.summaryValue}>{formatTime(journey.actualArrival)}</Text>
              </View>
            </View>

            {journey.checkIns?.length > 0 && (
              <>
                <Text style={styles.logTitle}>Check-in Log</Text>
                {journey.checkIns.map((checkIn: any, index: number) => (
                  <View key={index} style={styles.logRow}>
                    <Ionicons
                      name={checkIn.status === 'SAFE' ? 'checkmark-circle' : 'warning'}
                      size={18}
                      color={checkIn.status === 'SAFE' ? COLORS.success : COLORS.danger}
                    />
                    <Text style={styles.logText}>{checkIn.status}</Text>
                    <Text style={styles.logTime}>{formatTime(checkIn.respondedAt || checkIn.requestedAt)}</Text>
                  </View>
                ))}
              </>
            )}

            <TouchableOpacity style={styles.endButton} onPress={() => router.replace('/(app)/(tabs)')}>
              <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
              <Text style={styles.endButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>

      {/* Journey Complete Celebration — shown once the end-journey API call has already
          succeeded, purely as a "you made it" moment before returning home. */}
      {showCompleteCelebration && (
        <View style={styles.celebrationOverlay}>
          <JourneyCompleteScene width={260} height={190} />
          <Animated.View
            style={{
              opacity: celebrationTextAnim,
              transform: [{ translateY: celebrationTextAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
            }}
          >
            <Text style={styles.celebrationTitle}>You Made It!</Text>
            <Text style={styles.celebrationSubtitle}>Journey complete — nice work getting there safely.</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    gap: SPACING.md,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  map: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: 'rgba(38, 41, 31, 0.65)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  centerButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: COLORS.bgCard,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  missedOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  missedCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger + '50',
    gap: SPACING.sm,
  },
  missedTitle: {
    fontSize: 20,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  missedSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  missedCountdown: {
    fontSize: 36,
    fontWeight: FONTS.extraBold,
    color: COLORS.danger,
    marginBottom: SPACING.sm,
  },
  missedEmergencyButton: {
    marginTop: SPACING.xs,
    padding: SPACING.sm,
  },
  missedEmergencyText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: FONTS.semiBold,
  },
  bottomSheet: {
    maxHeight: '60%',
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  journeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  journeyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  journeyName: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  journeyDest: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
  },
  safeButton: {
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.lg,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    width: '100%',
  },
  safeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: FONTS.extraBold,
    letterSpacing: 1,
    marginLeft: SPACING.sm,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  endButton: {
    flex: 1,
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  endButtonText: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.semiBold,
    fontSize: 14,
    marginLeft: SPACING.xs,
  },
  emergencyButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.md,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  emergencyButtonText: {
    color: 'white',
    fontWeight: FONTS.bold,
    fontSize: 14,
    letterSpacing: 0.5,
    marginLeft: SPACING.xs,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  shareButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: FONTS.semiBold,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: FONTS.semiBold,
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: FONTS.semiBold,
    marginTop: 4,
  },
  logTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: FONTS.medium,
  },
  logTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: FONTS.extraBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
