import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import Constants from 'expo-constants';
import { api } from './api';

// NOTE ON TESTABILITY: expo-location's background APIs need native config (Info.plist keys on
// iOS, a foreground-service declaration on Android) that only exists in a real dev/standalone
// build — Expo Go ships one fixed, shared native shell that doesn't have it, and correctly
// *throws* rather than silently no-opping (ERR_LOCATION_INFO_PLIST on iOS, a permission error on
// Android). That's expected here, not a bug, since this project hasn't been built with EAS Build
// or a local prebuild — so this checks for Expo Go up front and skips the native call entirely,
// rather than letting it throw and reporting a real error for a known, unsupported combination.
const isExpoGo = Constants.appOwnership === 'expo';

export const BACKGROUND_LOCATION_TASK = 'homecoming-background-location';

let activeJourneyId: string | null = null;

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Background location task error', error);
    return;
  }
  if (!activeJourneyId) return;

  const locations = data?.locations as Location.LocationObject[] | undefined;
  const latest = locations?.[locations.length - 1];
  if (!latest) return;

  try {
    await api.post(`/journeys/${activeJourneyId}/location`, {
      location: {
        latitude: latest.coords.latitude,
        longitude: latest.coords.longitude,
        accuracy: latest.coords.accuracy,
        speed: latest.coords.speed,
        heading: latest.coords.heading,
      },
    });
  } catch (err) {
    console.error('Failed to post background location', err);
  }
});

let hasLoggedExpoGoNotice = false;

export async function startBackgroundLocationTracking(journeyId: string): Promise<boolean> {
  if (isExpoGo) {
    if (!hasLoggedExpoGoNotice) {
      hasLoggedExpoGoNotice = true;
      console.log(
        'Background location tracking is skipped in Expo Go (needs a dev/standalone build). ' +
          'Foreground tracking, check-ins, and emergency alerts are unaffected.'
      );
    }
    return false;
  }

  try {
    const foreground = await Location.getForegroundPermissionsAsync();
    if (!foreground.granted) return false;

    const background = await Location.requestBackgroundPermissionsAsync();
    if (!background.granted) return false;

    activeJourneyId = journeyId;
    const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (alreadyStarted) return true;

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 15000,
      distanceInterval: 15,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Homecoming is tracking your journey',
        notificationBody: 'Your location is being shared with your trusted contacts.',
      },
    });
    return true;
  } catch (err) {
    console.error('Failed to start background location tracking', err);
    return false;
  }
}

export async function stopBackgroundLocationTracking() {
  activeJourneyId = null;
  if (isExpoGo) return;
  try {
    const started = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (started) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
  } catch (err) {
    console.error('Failed to stop background location tracking', err);
  }
}
