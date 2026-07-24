import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { colors, spacing } from '../src/theme/colors';
import { common } from '../src/theme/commonStyles';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import { useGoogleAuth } from '../src/hooks/userGoogleAuth';
import { api, saveToken } from '../src/services/api';

const GOOGLE_ICON = require('../assets/social/google.png');
const APPLE_ICON = require('../assets/social/apple.png');

export default function Login() {
  const { login, setUser } = useAuth();
  // Accès au contexte d’auth : login() + mise à jour de l’utilisateur

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // États du formulaire de connexion

  const { request, promptAsync } = useGoogleAuth(async (accessToken) => {
    try {
      const data = await api.post('/auth/google', { accessToken });
      // Envoie le token Google au backend pour validation

      await saveToken(data.token);
      // Sauvegarde du JWT localement

      setUser(data.user);
      // Mise à jour du contexte utilisateur

      router.replace('/');
      // Redirection vers l’accueil
    } catch (error) {
      Alert.alert('Erreur Google', error.message);
      // Gestion des erreurs Google OAuth
    }
  });


  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Champs manquants', 'Email et mot de passe sont requis.');
      return;
      // Validation minimale du formulaire
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      // Appelle la fonction login() du contexte → requête backend

      router.replace('/');
      // Redirection après connexion réussie
    } catch (error) {
      Alert.alert('Erreur', error.message);
      // Affiche l’erreur renvoyée par le backend
    } finally {
      setIsSubmitting(false);
    }
  };


return (
    <SafeAreaView style={common.safeArea}>
      <KeyboardAvoidingView
        style={common.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // Remonte le formulaire sur iOS quand le clavier apparaît
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          // Permet de garder le focus sur les inputs même en scrollant
        >
          <View style={common.logoContainer}>
            <Image
              source={require('../assets/tabs/header-logo.png')}
              style={common.logo}
              resizeMode="contain"
            />
            {/* Logo de l’application */}
          </View>

          <View style={common.card}>
            {/* Carte contenant le formulaire */}

            <Text style={common.screenTitle}>Connecte-toi</Text>

            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Adresse email"
              autoCapitalize="none"
              keyboardType="email-address"
              // Champ email
            />

            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Mot de passe"
              secureTextEntry
              // Champ mot de passe
            />

            <Button
              label={isSubmitting ? '...' : 'Se connecter'}
              onPress={handleLogin}
              disabled={isSubmitting}
              size="full"
              // Bouton de connexion
            />

            <TouchableOpacity onPress={() => router.replace('/register')}>
              <Text style={common.switchText}>
                Pas encore de compte ? S inscrire
              </Text>
              {/* Lien vers l’inscription */}
            </TouchableOpacity>

            <View style={common.dividerRow}>
              <View style={common.dividerLine} />
              <Text style={common.dividerText}>ou</Text>
              <View style={common.dividerLine} />
              {/* Séparateur visuel */}
            </View>

            <Button
              label="Continuer avec Google"
              onPress={() => promptAsync()}
              variant="social"
              size="full"
              icon={GOOGLE_ICON}
              disabled={!request}
              // Connexion via Google OAuth
            />

            <Button
              label="Continuer avec Apple"
              onPress={() =>
                Alert.alert('Bientôt disponible', 'La connexion avec Apple arrive prochainement.')
              }
              variant="social"
              size="full"
              icon={APPLE_ICON}
              // Placeholder pour Apple OAuth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
});
