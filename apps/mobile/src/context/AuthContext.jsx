import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, saveToken, getToken, clearToken } from '../services/api';

const AuthContext = createContext(null);
// Contexte global d’authentification

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Objet utilisateur (null = non connecté)

  const [isLoading, setIsLoading] = useState(true);
  // Indique si on vérifie une session existante


  useEffect(() => {
    checkExistingSession();
  }, []);
  // Au montage : vérifie si un token est déjà stocké


  const checkExistingSession = async () => {
    const token = await getToken();

    if (token) {
      // Si un token existe --> on considère l’utilisateur connecté
      // (Dans une vraie app : on vérifierait via /auth/me)
      setUser({ hasToken: true });
    }

    setIsLoading(false);
    // Fin du chargement initial
  };


   const register = async (email, password, firstName, objectif) => {
    const data = await api.post('/auth/register', {
      email,
      password,
      firstName,
      objectif,
    });
    // Appel API d’inscription

    await saveToken(data.token);
    // Stocke le token localement

    setUser(data.user);
    // Met à jour l’utilisateur dans le contexte

    return data;
  };


  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    // Appel API de login

    await saveToken(data.token);
    // Stocke le token

    setUser(data.user);
    // Met à jour l’utilisateur

    return data;
  };


  const logout = async () => {
    await clearToken();
    // Supprime le token stocké

    setUser(null);
    // Réinitialise l’état utilisateur
  };


  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoading, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider");
    // Sécurité : empêche l’utilisation hors du provider
  }

  return context;
}

