import * as Location from 'expo-location';
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button, EmptyState, FAB, Input } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useLocation } from '../../hooks/useLocation';

const DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

export default function MapScreen() {
  const { colors, spacing, radii, typography, shadows } = useTheme();
  const { showToast } = useToast();
  const { status, location, error, isLoading } = useLocation();

  const mapRef = useRef(null);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [destination, setDestination] = useState(null);

  const recenter = () => {
    if (!location) return;
    mapRef.current?.animateToRegion(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        ...DELTA,
      },
      400
    );
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const results = await Location.geocodeAsync(query.trim());
      if (results.length === 0) {
        showToast('No matching location found', 'error');
        return;
      }

      const { latitude, longitude } = results[0];
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const label = address
        ? [address.name, address.street, address.city].filter(Boolean).join(', ')
        : query.trim();

      setDestination({ latitude, longitude, label });
      mapRef.current?.animateToRegion({ latitude, longitude, ...DELTA }, 400);
    } catch {
      showToast('Could not search for that location', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (status === 'denied') {
    return (
      <EmptyState
        icon={<Text style={{ fontSize: 40 }}>📍</Text>}
        title="Location access is off"
        message="Turn on location access in Settings so Homecoming can show you on the map and track your journeys."
        actionLabel="Open Settings"
        onAction={() => Linking.openSettings()}
        style={{ flex: 1, backgroundColor: colors.background }}
      />
    );
  }

  if (error || !location) {
    return (
      <EmptyState
        icon={<Text style={{ fontSize: 40 }}>⚠️</Text>}
        title="Couldn't get your location"
        message={error ?? 'Something went wrong finding your position.'}
        actionLabel="Retry"
        onAction={recenter}
        style={{ flex: 1, backgroundColor: colors.background }}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          ...DELTA,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {destination ? (
          <Marker
            coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
            title="Destination"
            description={destination.label}
            pinColor={colors.danger}
          />
        ) : null}
      </MapView>

      <View style={{ position: 'absolute', top: spacing.lg, left: spacing.lg, right: spacing.lg }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Search for a destination"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
          <Button title="Go" onPress={handleSearch} loading={isSearching} style={{ paddingHorizontal: spacing.lg }} />
        </View>

        {destination ? (
          <View
            style={[
              shadows.sm,
              {
                marginTop: spacing.sm,
                backgroundColor: colors.surface,
                borderRadius: radii.md,
                padding: spacing.md,
              },
            ]}
          >
            <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs }}>DESTINATION</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, marginTop: 2 }}>
              {destination.label}
            </Text>
          </View>
        ) : null}
      </View>

      <FAB
        icon={<Text style={{ fontSize: 20 }}>🎯</Text>}
        onPress={recenter}
        variant="primary"
        accessibilityLabel="Recenter on my location"
        style={{ position: 'absolute', bottom: spacing.xl, right: spacing.xl }}
      />
    </View>
  );
}
