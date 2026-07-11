import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, saveToken, getToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const token = await getToken();
    if (token) {
      // On a un token stocké, on considère la session valide
      // (une vraie app vérifierait sa validité via un appel /auth/me)
      setUser({ hasToken: true });
    }
    setIsLoading(false);
  };

  const register = async (email, password, firstName, objectif) => {
  const data = await api.post('/auth/register', { 
    email, password, firstName, objectif 
  });
  await saveToken(data.token);
  setUser(data.user);
  return data;
};

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    await saveToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  }
  return context;
}
