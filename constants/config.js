export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

// The API is mounted under /api, but uploaded media is served from the server root.
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export function resolveMediaUrl(path) {
  if (!path) return path;
  return /^https?:\/\//.test(path) ? path : `${API_ORIGIN}${path}`;
}
