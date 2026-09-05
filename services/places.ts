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
// endpoint only answers text queries, not "what's nearby." The public instance is shared and
// rate-limits aggressively under load, occasionally answering with an HTML "too busy" page
// instead of JSON — so this tries a couple of public mirrors and parses defensively rather than
// assuming any single request succeeds.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function queryOverpass(query: string): Promise<any> {
  let lastError: unknown;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: query,
      });
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('json')) {
        // A busy/rate-limited Overpass instance answers with an HTML page, not an HTTP error —
        // catching that here (via content-type) avoids a raw JSON.parse crash on "<html>...".
        throw new Error(`Overpass returned non-JSON response (status ${response.status})`);
      }
      return await response.json();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export async function fetchNearbyPlaces(
  center: { latitude: number; longitude: number },
  radiusMeters = 3000
): Promise<NearbyPlace[]> {
  const query = `[out:json][timeout:15];(node["tourism"](around:${radiusMeters},${center.latitude},${center.longitude});node["historic"](around:${radiusMeters},${center.latitude},${center.longitude});node["leisure"="park"](around:${radiusMeters},${center.latitude},${center.longitude}););out body 30;`;

  try {
    const data = await queryOverpass(query);
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
    // Both mirrors failing is an anticipated flakiness of a free, shared, unauthenticated public
    // API — not a bug — so this warns rather than escalating to console.error/LogBox. The Nearby
    // tab already renders an empty-but-not-broken state for a zero-length result.
    console.warn('Nearby places unavailable right now (Overpass API busy or rate-limited)', err);
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
