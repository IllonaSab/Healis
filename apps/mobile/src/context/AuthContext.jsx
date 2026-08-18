import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, saveToken, getToken, clearToken, saveUser, getUser, clearUser } from '../services/api';

// Crée le contexte React pour partager l'état utilisateur à toute l'arborescence
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Indique si la vérification initiale de session locale est en cours
  const [isLoading, setIsLoading] = useState(true);

  // Vérifie la présence d'une session enregistrée dès l'ouverture de l'application
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Restaure le token et les données utilisateur depuis le stockage local (SecureStore / AsyncStorage)
  const checkExistingSession = async () => {
    const token = await getToken();
    if (token) {
      const savedUser = await getUser();
      // Si l'utilisateur est trouvé en local, on restaure son profil, sinon un objet minimal
      setUser(savedUser || { hasToken: true });
    }
    setIsLoading(false);
  };

  // Inscription : envoie les données, sauvegarde le JWT et le profil en local, puis met à jour l'état
  const register = async (email, password, firstName, objectif) => {
    const data = await api.post('/auth/register', {
      email,
      password,
      firstName,
      objectif,
    });
    await saveToken(data.token);
    await saveUser(data.user);
    setUser(data.user);
    return data;
  };

  // Connexion : authentifie l'utilisateur, stocke son token/profil et met à jour l'état global
  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    await saveToken(data.token);
    await saveUser(data.user);
    setUser(data.user);
    return data;
  };

  // Déconnexion : purge le token et le profil du stockage local et réinitialise l'état utilisateur à null
  const logout = async () => {
    await clearToken();
    await clearUser();
    setUser(null);
  };

  return (
    // Expose les données et les fonctions d'authentification à l'ensemble des composants enfants
    <AuthContext.Provider
      value={{ user, setUser, isLoading, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour consommer facilement le contexte d'authentification avec garde-fou
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider");
  }
  return context;
}