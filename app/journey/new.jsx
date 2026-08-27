import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Button, EmptyState, Input } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { listGuardians } from '../../services/guardians';
import { createJourney } from '../../services/journeys';

const ARRIVAL_PRESETS = [15, 30, 45, 60];

function Pill({ label, selected, onPress }) {
  const { spacing, radii, typography } = useTheme();

  return (
    <Button
      title={label}
      variant={selected ? 'primary' : 'secondary'}
      onPress={onPress}
      style={{ paddingHorizontal: spacing.md, marginRight: spacing.sm, marginBottom: spacing.sm, minHeight: 40, borderRadius: radii.full }}
      textStyle={{ fontSize: typography.size.sm }}
    />
  );
}

export default function NewJourneyScreen() {
  const { colors, spacing, typography } = useTheme();
  const { showToast } = useToast();

  const [loadState, setLoadState] = useState('loading');
  const [guardians, setGuardians] = useState([]);
  const [selectedGuardianIds, setSelectedGuardianIds] = useState(new Set());

  const [destinationQuery, setDestinationQuery] = useState('');
  const [destination, setDestination] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const [minutesFromNow, setMinutesFromNow] = useState(30);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGuardians = async () => {
    setLoadState('loading');
    try {
      const data = await listGuardians();
      setGuardians(data);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  };

  useEffect(() => {
    fetchGuardians();
  }, []);

  const toggleGuardian = (id) => {
    setSelectedGuardianIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const searchDestination = async () => {
    if (!destinationQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await Location.geocodeAsync(destinationQuery.trim());
      if (results.length === 0) {
        showToast('No matching location found', 'error');
        return;
      }
      const { latitude, longitude } = results[0];
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const label = address
        ? [address.name, address.street, address.city].filter(Boolean).join(', ')
        : destinationQuery.trim();
      setDestination({ lat: latitude, lng: longitude, address: label });
      setErrors((prev) => ({ ...prev, destination: undefined }));
    } catch {
      showToast('Could not search for that location', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const expectedArrival = useMemo(() => new Date(Date.now() + minutesFromNow * 60 * 1000), [minutesFromNow]);

  const handleStart = async () => {
    const nextErrors = {};
    if (!destination) nextErrors.destination = 'Search for a destination first';
    if (selectedGuardianIds.size === 0) nextErrors.guardians = 'Choose at least one guardian';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        showToast('Location access is needed to start a journey', 'error');
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [originAddress] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      const journey = await createJourney({
        guardianIds: Array.from(selectedGuardianIds),
        origin: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: originAddress
            ? [originAddress.name, originAddress.street, originAddress.city].filter(Boolean).join(', ')
            : '',
        },
        destination,
        expectedArrival: expectedArrival.toISOString(),
      });

      router.replace(`/journey/${journey._id}`);
    } catch (err) {
      showToast(err.response?.data?.error ?? 'Could not start the journey', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadState === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (loadState === 'error') {
    return (
      <EmptyState
        icon={<Text style={{ fontSize: 40 }}>⚠️</Text>}
        title="Couldn't load your guardians"
        message="Check your connection and try again."
        actionLabel="Retry"
        onAction={fetchGuardians}
        style={{ flex: 1, backgroundColor: colors.background }}
      />
    );
  }

  if (guardians.length === 0) {
    return (
      <EmptyState
        icon={<Text style={{ fontSize: 40 }}>🛡️</Text>}
        title="Add a guardian first"
        message="You need at least one guardian before you can start a journey."
        actionLabel="Add a guardian"
        onAction={() => router.push('/guardians')}
        style={{ flex: 1, backgroundColor: colors.background }}
      />
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={{ color: colors.textPrimary, fontSize: typography.size.xxl, fontWeight: typography.weight.bold, marginBottom: spacing.lg }}>
        Start a journey
      </Text>

      <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, marginBottom: spacing.sm }}>
        DESTINATION
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Where are you headed?"
            value={destinationQuery}
            onChangeText={setDestinationQuery}
            onSubmitEditing={searchDestination}
            returnKeyType="search"
            error={errors.destination}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
        <Button title="Search" onPress={searchDestination} loading={isSearching} style={{ paddingHorizontal: spacing.lg, height: 44 }} />
      </View>
      {destination ? (
        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginTop: spacing.sm }}>
          📍 {destination.address}
        </Text>
      ) : null}

      <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, marginTop: spacing.xl, marginBottom: spacing.sm }}>
        GUARDIANS
      </Text>
      {errors.guardians ? (
        <Text style={{ color: colors.danger, fontSize: typography.size.xs, marginBottom: spacing.sm }}>{errors.guardians}</Text>
      ) : null}
      {guardians.map((guardian) => {
        const selected = selectedGuardianIds.has(guardian._id);
        return (
          <Button
            key={guardian._id}
            title={`${selected ? '✓ ' : ''}${guardian.name}${guardian.relation ? ` · ${guardian.relation}` : ''}`}
            variant={selected ? 'primary' : 'secondary'}
            onPress={() => toggleGuardian(guardian._id)}
            style={{ marginBottom: spacing.sm, justifyContent: 'flex-start', paddingHorizontal: spacing.lg }}
          />
        );
      })}

      <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, marginTop: spacing.xl, marginBottom: spacing.sm }}>
        I'LL BE BACK IN
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {ARRIVAL_PRESETS.map((minutes) => (
          <Pill key={minutes} label={`${minutes} min`} selected={minutesFromNow === minutes} onPress={() => setMinutesFromNow(minutes)} />
        ))}
      </View>

      <Button title="Start journey" onPress={handleStart} loading={isSubmitting} style={{ marginTop: spacing.xl }} />
    </ScrollView>
  );
}
