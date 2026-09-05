// Journey templates are a personal quick-start shortcut (re-use a common route without retyping
// it), not something that needs to sync across devices or be visible to anyone else — plain
// on-device storage is the right amount of infrastructure for that, no backend model needed.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TransportMode } from './routing';

const TEMPLATES_KEY = 'homecoming.journeyTemplates';

export type JourneyTemplate = {
  id: string;
  name: string;
  destination: string;
  placeLatitude?: number;
  placeLongitude?: number;
  transportMode: TransportMode;
};

export async function loadTemplates(): Promise<JourneyTemplate[]> {
  try {
    const stored = await AsyncStorage.getItem(TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Failed to load journey templates', err);
    return [];
  }
}

export async function saveTemplate(template: Omit<JourneyTemplate, 'id'>): Promise<JourneyTemplate[]> {
  const current = await loadTemplates();
  const next = [{ id: Date.now().toString(), ...template }, ...current];
  await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
  return next;
}

export async function deleteTemplate(id: string): Promise<JourneyTemplate[]> {
  const current = await loadTemplates();
  const next = current.filter((t) => t.id !== id);
  await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
  return next;
}
