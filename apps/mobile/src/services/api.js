import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = 'https://healis-qwss.onrender.com';
const TOKEN_KEY = 'healis_token';
// Clé unique pour stocker le token localement


export async function saveToken(token) {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
    // Sur web : stockage classique
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    // Sur mobile : stockage sécurisé (chiffré)
  }
}


export async function getToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
  // Retourne null si aucun token
}


export async function clearToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}


async function request(path, options = {}) {
  const token = await getToken();
  // Récupère le token pour l’ajouter dans les headers

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Ajoute le header Authorization uniquement si token présent
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  // Appel HTTP final

  const data = await response.json().catch(() => null);
  // Si la réponse n’est pas JSON → retourne null

  if (!response.ok) {
    // Gestion des erreurs API
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
// Interface simple pour appeler l’API sans répéter fetch()
