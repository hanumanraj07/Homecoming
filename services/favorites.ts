// Favorite / saved destinations — a short personal list of places (not full journeys, that's
// what templates are for), kept on-device since it's a per-user convenience, not shared data.
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'homecoming.favoriteLocations';

export type FavoriteLocation = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

export async function loadFavorites(): Promise<FavoriteLocation[]> {
  try {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export async function addFavorite(place: { label: string; latitude: number; longitude: number }): Promise<FavoriteLocation[]> {
  const current = await loadFavorites();
  // Avoid duplicate pins for the same spot (within ~10m) piling up every time it's re-saved.
  const isDuplicate = current.some(
    (f) => Math.abs(f.latitude - place.latitude) < 0.0001 && Math.abs(f.longitude - place.longitude) < 0.0001
  );
  if (isDuplicate) return current;

  const next = [{ id: Date.now().toString(), ...place }, ...current].slice(0, 20);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

export async function removeFavorite(id: string): Promise<FavoriteLocation[]> {
  const current = await loadFavorites();
  const next = current.filter((f) => f.id !== id);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}
