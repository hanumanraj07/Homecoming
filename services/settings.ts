// On-device notification preferences — these gate the app's own in-app alerts (missed check-in
// escalation, low-battery warning), not a push-notification service. There's no backend need for
// these since they only affect what this device does locally during a journey.
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'homecoming.notificationSettings';

export type NotificationSettings = {
  missedCheckInAlerts: boolean;
  lowBatteryWarnings: boolean;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  missedCheckInAlerts: true,
  lowBatteryWarnings: true,
};

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
