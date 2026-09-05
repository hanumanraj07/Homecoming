import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { JourneyTemplate } from '../../services/templates';
import { Ionicons } from '@expo/vector-icons';
import { CompassIntro } from '../Illustrations';
import { searchPlacesByText, fetchNearbyPlaces, formatPlaceDistance, PlaceSuggestion, NearbyPlace } from '../../services/places';
import { loadFavorites, addFavorite, removeFavorite, FavoriteLocation } from '../../services/favorites';
import { MapPicker } from './MapPicker';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme/colors';

type Place = { label: string; latitude: number; longitude: number };

type Tab = 'manual' | 'map' | 'saved' | 'nearby';

const TABS: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'manual', label: 'Enter', icon: 'create-outline' },
  { key: 'map', label: 'Map', icon: 'map-outline' },
  { key: 'saved', label: 'Saved', icon: 'star-outline' },
  { key: 'nearby', label: 'Nearby', icon: 'compass-outline' },
];

const TEMPLATE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  walking: 'walk-outline',
  driving: 'car-outline',
  cycling: 'bicycle-outline',
  bus: 'bus-outline',
};

export function StepDestination({
  name,
  place,
  location,
  templates,
  onChangeName,
  onSelectPlace,
  onApplyTemplate,
  onDeleteTemplate,
  onNext,
}: {
  name: string;
  place: Place | null;
  location: { latitude: number; longitude: number } | null;
  templates: JourneyTemplate[];
  onChangeName: (name: string) => void;
  onSelectPlace: (place: Place | null) => void;
  onApplyTemplate: (template: JourneyTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onNext: () => void;
}) {
  const [tab, setTab] = useState<Tab>('manual');
  const [query, setQuery] = useState(place?.label || '');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryRef = useRef('');

  const [mapPickerVisible, setMapPickerVisible] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);

  const [nearby, setNearby] = useState<NearbyPlace[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const hasLoadedNearbyRef = useRef(false);

  useEffect(() => {
    loadFavorites().then(setFavorites);
  }, []);

  // Keeps the manual-search box in sync when a destination arrives from elsewhere (a template,
  // a saved favorite, a nearby pick, or the map picker) rather than from typing here directly.
  useEffect(() => {
    if (place) setQuery(place.label);
  }, [place]);

  useEffect(() => {
    if (tab !== 'nearby' || hasLoadedNearbyRef.current || !location) return;
    hasLoadedNearbyRef.current = true;
    setIsLoadingNearby(true);
    fetchNearbyPlaces(location).then((results) => {
      setNearby(results);
      setIsLoadingNearby(false);
    });
  }, [tab, location]);

  const isFavorite = useMemo(
    () =>
      !!place &&
      favorites.some((f) => Math.abs(f.latitude - place.latitude) < 0.0001 && Math.abs(f.longitude - place.longitude) < 0.0001),
    [favorites, place]
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    onSelectPlace(null);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      latestQueryRef.current = trimmed;
      setIsSearching(true);
      try {
        const results = await searchPlacesByText(trimmed);
        if (latestQueryRef.current === trimmed) setSuggestions(results);
      } catch (err) {
        console.error('Place search failed', err);
      } finally {
        if (latestQueryRef.current === trimmed) setIsSearching(false);
      }
    }, 400);
  };

  const selectPlace = (p: Place) => {
    onSelectPlace(p);
    setQuery(p.label);
    setSuggestions([]);
  };

  const handleToggleFavorite = async () => {
    if (!place) return;
    setIsSavingFavorite(true);
    if (isFavorite) {
      const match = favorites.find(
        (f) => Math.abs(f.latitude - place.latitude) < 0.0001 && Math.abs(f.longitude - place.longitude) < 0.0001
      );
      if (match) setFavorites(await removeFavorite(match.id));
    } else {
      setFavorites(await addFavorite(place));
    }
    setIsSavingFavorite(false);
  };

  const canContinue = !!name && !!place;

  const handleNext = () => {
    if (!name && !place) {
      Alert.alert('Almost there', 'Give the journey a name and pick a destination to continue.');
      return;
    }
    if (!name) {
      Alert.alert('Name this journey', 'Add a short name so you can recognize it later.');
      return;
    }
    if (!place) {
      Alert.alert('Pick a destination', 'Choose a destination using any of the tabs above.');
      return;
    }
    onNext();
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.illustration}>
          <CompassIntro size={130} />
        </View>

        <Text style={styles.title}>Where are you headed?</Text>
        <Text style={styles.subtitle}>Name the trip and pick a destination any way you like.</Text>

        {templates.length > 0 && (
          <>
            <Text style={styles.label}>Quick Start</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
              {templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => onApplyTemplate(template)}
                  onLongPress={() =>
                    Alert.alert('Delete Template', `Remove "${template.name}"?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => onDeleteTemplate(template.id) },
                    ])
                  }
                >
                  <Ionicons name={TEMPLATE_ICON[template.transportMode] || 'walk-outline'} size={18} color={COLORS.primary} />
                  <Text style={styles.templateName} numberOfLines={1}>{template.name}</Text>
                  <Text style={styles.templateDest} numberOfLines={1}>{template.destination}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <View style={styles.inputWrapper}>
          <Ionicons name="flag-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Walking home from station"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={onChangeName}
          />
        </View>

        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabButton, tab === t.key && styles.tabButtonActive]}
              onPress={() => setTab(t.key)}
            >
              <Ionicons name={t.icon} size={16} color={tab === t.key ? 'white' : COLORS.textSecondary} />
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'manual' && (
          <View>
            <View style={styles.inputWrapper}>
              <Ionicons name="search-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Search for an address or place"
                placeholderTextColor={COLORS.textMuted}
                value={query}
                onChangeText={handleQueryChange}
              />
              {isSearching ? <ActivityIndicator size="small" color={COLORS.textMuted} /> : null}
              {place ? <Ionicons name="checkmark-circle" size={18} color={COLORS.success} /> : null}
            </View>
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={`${s.latitude}-${s.longitude}`}
                style={[styles.listRow, i < suggestions.length - 1 && styles.listRowDivider]}
                onPress={() => selectPlace(s)}
              >
                <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.listRowText} numberOfLines={2}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {tab === 'map' && (
          <TouchableOpacity
            style={styles.mapPickerButton}
            onPress={() => {
              if (!location) {
                Alert.alert('Location Not Ready', 'Still finding your current position — try again in a moment.');
                return;
              }
              setMapPickerVisible(true);
            }}
          >
            <Ionicons name="map" size={20} color={COLORS.primary} />
            <Text style={styles.mapPickerText}>Open Map to Drop a Pin</Text>
          </TouchableOpacity>
        )}

        {tab === 'saved' && (
          <View>
            {favorites.length === 0 ? (
              <Text style={styles.hint}>
                No saved places yet. Select a destination on any tab, then tap the star to save it here.
              </Text>
            ) : (
              favorites.map((f, i) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.listRow, i < favorites.length - 1 && styles.listRowDivider]}
                  onPress={() => selectPlace(f)}
                >
                  <Ionicons name="star" size={16} color={COLORS.warning} />
                  <Text style={styles.listRowText} numberOfLines={2}>{f.label}</Text>
                  <TouchableOpacity onPress={() => removeFavorite(f.id).then(setFavorites)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {tab === 'nearby' && (
          <View>
            {isLoadingNearby ? (
              <View style={styles.centeredRow}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.hint}>Finding notable places nearby…</Text>
              </View>
            ) : nearby.length === 0 ? (
              <Text style={styles.hint}>Nothing notable found nearby, or your location isn't ready yet.</Text>
            ) : (
              nearby.map((p, i) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.listRow, i < nearby.length - 1 && styles.listRowDivider]}
                  onPress={() => selectPlace(p)}
                >
                  <Ionicons name="compass-outline" size={16} color={COLORS.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listRowText}>{p.label}</Text>
                    <Text style={styles.listRowSub}>{p.category} · {formatPlaceDistance(p.distanceMeters)} away</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {place && (
          <View style={styles.selectedBox}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            <Text style={styles.selectedText} numberOfLines={2}>{place.label}</Text>
            <TouchableOpacity onPress={handleToggleFavorite} disabled={isSavingFavorite} hitSlop={8}>
              <Ionicons name={isFavorite ? 'star' : 'star-outline'} size={20} color={COLORS.warning} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>Confirm Destination</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {location && (
        <MapPicker
          visible={mapPickerVisible}
          initialRegion={location}
          onCancel={() => setMapPickerVisible(false)}
          onConfirm={(p) => {
            selectPlace(p);
            setMapPickerVisible(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollFlex: {
    flex: 1,
  },
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 52,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  inputIcon: {},
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  templateScroll: {
    marginBottom: SPACING.md,
  },
  templateCard: {
    width: 140,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginRight: SPACING.sm,
  },
  templateName: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  templateDest: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: FONTS.medium,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: 'white',
    fontWeight: FONTS.semiBold,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: 6,
  },
  listRowDivider: {},
  listRowText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  listRowSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  hint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    padding: SPACING.md,
  },
  centeredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  mapPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    height: 56,
  },
  mapPickerText: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
  },
  selectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.success + '15',
    borderWidth: 1,
    borderColor: COLORS.success + '40',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  selectedText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
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
