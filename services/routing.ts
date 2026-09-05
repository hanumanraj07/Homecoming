// Route lookup + travel-time estimation, shared by the journey creation wizard (which needs
// duration estimates and alternate routes before the journey exists) and the active journey map
// (which needs the polyline to draw).
//
// IMPORTANT — why the durations here aren't taken straight from OSRM:
// No Google Directions API key is configured, so this uses OSRM's free public demo server. That
// server only hosts the *driving* road network in practice — asking it for "foot" or "bike"
// returns the identical route and a car duration. So we use OSRM for the road distance (which is
// mode-independent enough to be useful) and derive walking/cycling times from typical speeds
// ourselves. On a self-hosted or paid OSRM instance the per-profile durations would be usable
// directly, which is why the correct profile name is still sent.
//
// There's no free, no-signup live transit API, so "Bus" reuses the road route/duration with an
// honest label rather than fabricating a schedule.

export type RouteCoordinate = { latitude: number; longitude: number };

export type TransportMode = 'walking' | 'driving' | 'cycling' | 'bus';

export type RouteSummary = {
  coordinates: RouteCoordinate[];
  distanceMeters: number;
  durationMinutes: number;
  /** True when the road network was unreachable and this is a straight-line approximation. */
  isApproximate: boolean;
};

const OSRM_PROFILE_BY_MODE: Record<TransportMode, string> = {
  walking: 'foot',
  driving: 'driving',
  cycling: 'bike',
  bus: 'driving',
};

// Average door-to-door speeds in km/h, deliberately conservative — an over-estimated arrival
// time is much safer here than an under-estimated one, since a journey running past its
// expected arrival is what prompts people to check on you.
const SPEED_KMH: Record<TransportMode, number> = {
  walking: 4.5,
  cycling: 14,
  driving: 30,
  bus: 22,
};

// Roads rarely run straight between two points; used only for the offline fallback estimate.
const DETOUR_FACTOR = 1.3;

export function haversineMeters(a: RouteCoordinate, b: RouteCoordinate): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function minutesFor(distanceMeters: number, mode: TransportMode, osrmDurationSeconds?: number): number {
  // Driving (and bus, which piggybacks on the same road route) is the one profile the public
  // server actually models, so trust its duration there — it accounts for road speeds and turns
  // in a way a flat average can't.
  if ((mode === 'driving' || mode === 'bus') && osrmDurationSeconds && osrmDurationSeconds > 0) {
    const scale = mode === 'bus' ? SPEED_KMH.driving / SPEED_KMH.bus : 1;
    return Math.max(1, Math.ceil((osrmDurationSeconds / 60) * scale));
  }
  const hours = distanceMeters / 1000 / SPEED_KMH[mode];
  return Math.max(1, Math.ceil(hours * 60));
}

function toRouteSummary(route: any, mode: TransportMode): RouteSummary | null {
  const coords = route?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length === 0 || typeof route?.distance !== 'number') return null;
  return {
    coordinates: coords.map(([lon, lat]: [number, number]) => ({ latitude: lat, longitude: lon })),
    distanceMeters: route.distance,
    durationMinutes: minutesFor(route.distance, mode, route.duration),
    isApproximate: false,
  };
}

function straightLineFallback(start: RouteCoordinate, end: RouteCoordinate, mode: TransportMode): RouteSummary {
  const distanceMeters = haversineMeters(start, end) * DETOUR_FACTOR;
  return {
    coordinates: [start, end],
    distanceMeters,
    durationMinutes: minutesFor(distanceMeters, mode),
    isApproximate: true,
  };
}

export async function fetchRouteSummary(
  start: RouteCoordinate,
  end: RouteCoordinate,
  mode: TransportMode
): Promise<RouteSummary> {
  const profile = OSRM_PROFILE_BY_MODE[mode] || 'foot';
  const url = `https://router.project-osrm.org/route/v1/${profile}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const summary = toRouteSummary(data?.routes?.[0], mode);
    if (summary) return summary;
  } catch {
    // Fall through to the straight-line estimate below.
  }

  // No route found (destination across water, server down, offline): still give the user a
  // usable number and a straight line to draw, flagged so the UI can say it's approximate.
  return straightLineFallback(start, end, mode);
}

// Multiple route choices for the "pick your route" wizard step. OSRM's `alternatives` flag is
// only meaningfully supported by the public server's driving profile — for walking/cycling it
// reliably returns just the one route, so this honestly returns a single-item list there rather
// than pretending to offer a choice that doesn't exist.
export async function fetchRouteAlternatives(
  start: RouteCoordinate,
  end: RouteCoordinate,
  mode: TransportMode
): Promise<RouteSummary[]> {
  const profile = OSRM_PROFILE_BY_MODE[mode] || 'foot';
  const wantsAlternatives = mode === 'driving' || mode === 'bus';
  const url = `https://router.project-osrm.org/route/v1/${profile}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson${wantsAlternatives ? '&alternatives=true' : ''}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const routes = Array.isArray(data?.routes) ? data.routes : [];
    const summaries = routes
      .map((r: any) => toRouteSummary(r, mode))
      .filter((s: RouteSummary | null): s is RouteSummary => s !== null)
      // Fastest first, cap at 3 so the picker stays scannable.
      .sort((a: RouteSummary, b: RouteSummary) => a.durationMinutes - b.durationMinutes)
      .slice(0, 3);

    if (summaries.length > 0) return summaries;
  } catch {
    // Fall through to the straight-line estimate below.
  }

  return [straightLineFallback(start, end, mode)];
}

// How often the app should ask "are you safe?" during the trip — derived from the trip length
// rather than picked by hand. Aims for roughly 3 check-ins over the journey (rounded to a clean
// 5-minute step), clamped so a short walk still gets at least one check partway through and a
// long drive doesn't go over half an hour between checks.
export function calculateCheckInInterval(durationMinutes: number): number {
  const raw = durationMinutes / 3;
  const roundedToFive = Math.round(raw / 5) * 5;
  return Math.min(30, Math.max(5, roundedToFive || 5));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}
