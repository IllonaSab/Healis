import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Fournit le contexte d’auth à toute l’application */}
      
      <Stack screenOptions={{ headerShown: false }}>
        {/* Navigation principale : stack sans header */}

        <Stack.Screen name="(tabs)" />
        {/* Groupe des onglets (Accueil, Chat, Stats, Profil) */}

        <Stack.Screen name="login" />
        {/* Écran de connexion */}

        <Stack.Screen name="register" />
        {/* Écran d’inscription */}
      </Stack>
    </AuthProvider>
  );
}
