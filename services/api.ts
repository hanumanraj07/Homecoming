import Constants from 'expo-constants';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_PORT = 5000;
const FALLBACK_HOST = '192.168.1.104'; // last-known dev machine IP, used only if auto-detection fails

// In Expo Go, the app knows the host/IP it used to reach the Metro dev server (it has to, in
// order to be running at all) — reusing that host for the API server means this never needs to
// be hand-edited again when the dev machine's Wi-Fi IP changes, which was happening repeatedly.
function resolveDevHost(): string {
  const hostUri = Constants.expoConfig?.hostUri ?? (Constants as any).expoGoConfig?.debuggerHost;
  const host = hostUri?.split(':')?.[0];
  return host || FALLBACK_HOST;
}

export const API_URL = `http://${resolveDevHost()}:${API_PORT}/api`;

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Every screen that calls the API was independently catching and alerting on 401s, which reads
// as "this feature is broken" when what actually happened is the session expired (most commonly
// in dev, because the backend's in-memory database resets on every restart and wipes the token
// it issued). Handling it once here means an expired session sends the user back to login
// instead of every tab showing its own cryptic error.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);
