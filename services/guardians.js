import { api } from './api';

export async function listGuardians() {
  const { data } = await api.get('/guardians');
  return data.guardians;
}

export async function createGuardian(payload) {
  const { data } = await api.post('/guardians', payload);
  return data.guardian;
}

export async function updateGuardian(id, payload) {
  const { data } = await api.patch(`/guardians/${id}`, payload);
  return data.guardian;
}

export async function deleteGuardian(id) {
  await api.delete(`/guardians/${id}`);
}
