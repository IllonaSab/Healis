import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// URL de base du backend déployé et clés de stockage local
const API_URL = 'https://healis-qwss.onrender.com';
const TOKEN_KEY = 'healis_token';
const USER_KEY = 'healis_user';

// --- GESTION DU TOKEN JWT ---

// Enregistre le token dans le stockage sécurisé sur mobile (iOS Keychain / Android Keystore) ou localStorage sur le web
export async function saveToken(token) {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

// Récupère le jeton JWT pour authentifier les futures requêtes
export async function getToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

// Supprime le token JWT lors de la déconnexion
export async function clearToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

// --- GESTION DU PROFIL UTILISATEUR ---

// Sérialise l'objet utilisateur en JSON avant de le stocker localement
export async function saveUser(user) {
  const value = JSON.stringify(user);
  if (Platform.OS === 'web') {
    localStorage.setItem(USER_KEY, value);
  } else {
    await SecureStore.setItemAsync(USER_KEY, value);
  }
}

// Récupère et désérialise les données utilisateur en objet JavaScript
export async function getUser() {
  if (Platform.OS === 'web') {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  }
  const value = await SecureStore.getItemAsync(USER_KEY);
  return value ? JSON.parse(value) : null;
}

// Supprime les données de profil en cache local
export async function clearUser() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(USER_KEY);
  } else {
    await SecureStore.deleteItemAsync(USER_KEY);
  }
}

// --- CLIENT HTTP CENTRALISÉ ---

// Fonction générique encapsulant le fetch natif avec gestion des headers et des erreurs
async function request(path, options = {}) {
  // Récupération automatique du token pour chaque requête
  const token = await getToken();

  // Ajout conditionnel du header d'autorisation 'Bearer <token>' si l'utilisateur est connecté
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // Tente de parser la réponse en JSON sans bloquer si le corps est vide
  const data = await response.json().catch(() => null);

  // Gestion centralisée des erreurs HTTP (4xx / 5xx)
  if (!response.ok) {
    throw new Error(data?.message || `Erreur ${response.status}`);
  }

  return data;
}

// Objet helper exposant les verbes HTTP standards pour simplifier les appels dans l'application
export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};