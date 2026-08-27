import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Badge, Button, EmptyState } from '../../components/ui';
import { PanicButton } from '../../components/journey/PanicButton';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useCountdown } from '../../hooks/useCountdown';
import { useLocation } from '../../hooks/useLocation';
import { useShakeDetector } from '../../hooks/useShakeDetector';
import { checkInJourney, getJourney, updateJourneyLocation } from '../../services/journeys';

const DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

export default function JourneyDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors, spacing, radii, typography, shadows } = useTheme();
  const { showToast } = useToast();

  const [journey, setJourney] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const isActive = journey?.status === 'active';
  const { location } = useLocation({ watch: isActive });
  const countdown = useCountdown(journey?.checkInDeadline);

  const fetchJourney = async () => {
    setLoadState('loading');
    try {
      const data = await getJourney(id);
      setJourney(data);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  };

  useEffect(() => {
    fetchJourney();
  }, [id]);

  useEffect(() => {
    if (!isActive || !location || !journey?._id) return;

    updateJourneyLocation(journey._id, location.coords.latitude, location.coords.longitude)
      .then(setJourney)
      .catch(() => {});
  }, [location, isActive, journey?._id]);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      const updated = await checkInJourney(journey._id);
      setJourney(updated);
      showToast("You're checked in", 'success');
    } catch {
      showToast('Could not check in. Try again.', 'error');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const triggerPanic = useCallback(() => {
    router.push({ pathname: '/incident/new', params: journey?._id ? { journeyId: journey._id } : {} });
  }, [journey?._id]);

  useShakeDetector(triggerPanic, { enabled: isActive });

  if (loadState === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (loadState === 'error' || !journey) {
    return (
      <EmptyState
        icon={<Text style={{ fontSize: 40 }}>⚠️</Text>}
        title="Couldn't load this journey"
        message="Check your connection and try again."
        actionLabel="Retry"
        onAction={fetchJourney}
        style={{ flex: 1, backgroundColor: colors.background }}
      />
    );
  }

  const pathCoordinates = (journey.path ?? []).map((point) => ({ latitude: point.lat, longitude: point.lng }));
  const current = journey.currentLocation;
  const statusLabel = { active: 'Active', completed: 'Completed', missed: 'Missed', sos: 'SOS' }[journey.status];
  const statusVariant = { active: 'primary', completed: 'success', missed: 'warning', sos: 'danger' }[journey.status];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: current?.lat ?? journey.origin.lat,
          longitude: current?.lng ?? journey.origin.lng,
          ...DELTA,
        }}
        showsUserLocation={isActive}
      >
        <Marker
          coordinate={{ latitude: journey.origin.lat, longitude: journey.origin.lng }}
          title="Start"
          pinColor={colors.success}
        />
        <Marker
          coordinate={{ latitude: journey.destination.lat, longitude: journey.destination.lng }}
          title="Destination"
          description={journey.destination.address}
          pinColor={colors.danger}
        />
        {current ? (
          <Marker coordinate={{ latitude: current.lat, longitude: current.lng }} title="Current position" />
        ) : null}
        {pathCoordinates.length > 1 ? (
          <Polyline coordinates={pathCoordinates} strokeColor={colors.primary} strokeWidth={4} />
        ) : null}
      </MapView>

      {isActive ? (
        <View style={{ position: 'absolute', top: spacing.xl, right: spacing.lg }}>
          <PanicButton onActivate={triggerPanic} />
        </View>
      ) : null}

      <View
        style={[
          shadows.lg,
          {
            backgroundColor: colors.surface,
            borderTopLeftRadius: radii.lg,
            borderTopRightRadius: radii.lg,
            padding: spacing.lg,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs }}>DESTINATION</Text>
          <Badge label={statusLabel} variant={statusVariant} size="sm" />
        </View>
        <Text style={{ color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.medium, marginTop: 2 }}>
          {journey.destination.address || `${journey.destination.lat.toFixed(4)}, ${journey.destination.lng.toFixed(4)}`}
        </Text>

        {isActive ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.md }}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm }}>Check in within </Text>
              <Text
                style={{
                  color: countdown.isOverdue ? colors.danger : colors.textPrimary,
                  fontSize: typography.size.lg,
                  fontWeight: typography.weight.bold,
                }}
              >
                {countdown.label}
              </Text>
            </View>
            <Button title="Check in" onPress={handleCheckIn} loading={isCheckingIn} style={{ marginTop: spacing.md }} />
          </>
        ) : (
          <Button
            title="Back to home"
            variant="secondary"
            onPress={() => router.replace('/')}
            style={{ marginTop: spacing.md }}
          />
        )}
      </View>
    </View>
  );
}
