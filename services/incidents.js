import { api } from './api';

export async function listIncidents() {
  const { data } = await api.get('/incidents');
  return data.incidents;
}

export async function getIncident(id) {
  const { data } = await api.get(`/incidents/${id}`);
  return data.incident;
}

export async function createIncident(payload) {
  const { data } = await api.post('/incidents', payload);
  return data.incident;
}
