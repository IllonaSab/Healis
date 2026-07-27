import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = 'https://healis-qwss.onrender.com';
const TOKEN_KEY = 'healis_token';
const USER_KEY = 'healis_user';

export async function saveToken(token) {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function saveUser(user) {
  const value = JSON.stringify(user);
  if (Platform.OS === 'web') {
    localStorage.setItem(USER_KEY, value);
  } else {
    await SecureStore.setItemAsync(USER_KEY, value);
  }
}

export async function getUser() {
  if (Platform.OS === 'web') {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  }
  const value = await SecureStore.getItemAsync(USER_KEY);
  return value ? JSON.parse(value) : null;
}

export async function clearUser() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(USER_KEY);
  } else {
    await SecureStore.deleteItemAsync(USER_KEY);
  }
}

async function request(path, options = {}) {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Erreur ${response.status}`);
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};