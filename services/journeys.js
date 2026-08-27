import { api } from './api';

export async function listJourneys() {
  const { data } = await api.get('/journeys');
  return data.journeys;
}

export async function getJourney(id) {
  const { data } = await api.get(`/journeys/${id}`);
  return data.journey;
}

export async function createJourney(payload) {
  const { data } = await api.post('/journeys', payload);
  return data.journey;
}

export async function updateJourneyLocation(id, lat, lng) {
  const { data } = await api.patch(`/journeys/${id}/location`, { lat, lng });
  return data.journey;
}

export async function checkInJourney(id) {
  const { data } = await api.post(`/journeys/${id}/check-in`);
  return data.journey;
}
