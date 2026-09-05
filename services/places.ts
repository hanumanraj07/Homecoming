// Nearby point-of-interest lookup and reverse geocoding — both free, no API key, consistent with
// the Nominatim-based destination search already used elsewhere in the app.
import { haversineMeters, formatDistance } from './routing';

export type NearbyPlace = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  category: string;
};

export type PlaceSuggestion = {
  label: string;
  latitude: number;
  longitude: number;
};

// No Google Maps API key is configured in this project, so free-text destination suggestions
// come from OpenStreetMap's free Nominatim search — no account/billing setup needed.
export async function searchPlacesByText(query: string): Promise<PlaceSuggestion[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
  const response = await fetch(url, { headers: { 'User-Agent': 'HomecomingApp/1.0' } });
  const data = await response.json();
  return data.map((item: any) => ({
    label: item.display_name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
  }));
}

// Overpass is OpenStreetMap's free query API for map data — used here to find named,
// notable spots (landmarks, parks, attractions) around the user, since Nominatim's search
// endpoint only answers text queries, not "what's nearby."
export async function fetchNearbyPlaces(
  center: { latitude: number; longitude: number },
  radiusMeters = 3000
): Promise<NearbyPlace[]> {
  const query = `[out:json][timeout:15];(node["tourism"](around:${radiusMeters},${center.latitude},${center.longitude});node["historic"](around:${radiusMeters},${center.latitude},${center.longitude});node["leisure"="park"](around:${radiusMeters},${center.latitude},${center.longitude}););out body 30;`;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: query,
    });
    const data = await response.json();
    const elements = Array.isArray(data?.elements) ? data.elements : [];

    const places: NearbyPlace[] = elements
      .filter((el: any) => el?.tags?.name && typeof el.lat === 'number' && typeof el.lon === 'number')
      .map((el: any) => {
        const coord = { latitude: el.lat, longitude: el.lon };
        return {
          id: String(el.id),
          label: el.tags.name,
          latitude: el.lat,
          longitude: el.lon,
          distanceMeters: haversineMeters(center, coord),
          category: el.tags.tourism || el.tags.historic || 'park',
        };
      })
      .sort((a: NearbyPlace, b: NearbyPlace) => a.distanceMeters - b.distanceMeters)
      .slice(0, 10);

    return places;
  } catch (err) {
    console.error('Failed to fetch nearby places', err);
    return [];
  }
}

export function formatPlaceDistance(meters: number): string {
  return formatDistance(meters);
}

// Turns a dropped map pin's coordinates back into a readable address for the "select on map"
// destination option.
export async function reverseGeocode(coord: { latitude: number; longitude: number }): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord.latitude}&lon=${coord.longitude}&zoom=17&addressdetails=0`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'HomecomingApp/1.0' } });
    const data = await response.json();
    return data?.display_name || `${coord.latitude.toFixed(5)}, ${coord.longitude.toFixed(5)}`;
  } catch {
    return `${coord.latitude.toFixed(5)}, ${coord.longitude.toFixed(5)}`;
  }
}
