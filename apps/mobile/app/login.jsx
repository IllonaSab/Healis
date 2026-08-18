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
import { useGoogleAuth } from '../src/hooks/useGoogleAuth';
import { api, saveToken } from '../src/services/api';

const GOOGLE_ICON = require('../assets/social/google.png');
const APPLE_ICON = require('../assets/social/apple.png');

export default function Login() {
  const { login, setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook personnalisé pour Google OAuth : récupère le token d'accès Google puis le valide auprès du backend
  const { request, promptAsync } = useGoogleAuth(async (accessToken) => {
    try {
      // Envoie le token Google à l'API pour créer ou connecter le compte
      const data = await api.post('/auth/google', { accessToken });

      // Enregistre le JWT retourné en local et met à jour l'utilisateur dans le contexte
      await saveToken(data.token);
      setUser(data.user);

      // Redirige vers l'écran d'accueil sans possibilité de retour arrière vers le login
      router.replace('/');
    } catch (error) {
      Alert.alert('Erreur Google', error.message);
    }
  });

  // Connexion classique par email et mot de passe
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Champs manquants', 'Email et mot de passe sont requis.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Appelle la méthode login du AuthContext (requête HTTP + stockage sécurisé du token)
      await login(email, password);
      router.replace('/');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={common.safeArea}>
      {/* Ajuste la vue sur iOS pour que le clavier ne masque pas le formulaire */}
      <KeyboardAvoidingView
        style={common.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={common.logoContainer}>
            <Image
              source={require('../assets/tabs/header-logo.png')}
              style={common.logo}
              resizeMode="contain"
            />
          </View>

          <View style={common.card}>
            <Text style={common.screenTitle}>Connecte-toi</Text>

            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Adresse email"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Mot de passe"
              secureTextEntry
            />

            <Button
              label={isSubmitting ? '...' : 'Se connecter'}
              onPress={handleLogin}
              disabled={isSubmitting}
              size="full"
            />

            {/* Ouvre l'écran de réinitialisation sans effacer la pile */}
            <TouchableOpacity onPress={() => router.push('/forgotPasseword')}>
              <Text style={styles.forgotText}>{'Mot de passe oublié ?'}</Text>
            </TouchableOpacity>

            {/* Remplace la vue actuelle par l'inscription */}
            <TouchableOpacity onPress={() => router.replace('/register')}>
              <Text style={common.switchText}>
                Pas encore de compte ? S inscrire
              </Text>
            </TouchableOpacity>

            <View style={common.dividerRow}>
              <View style={common.dividerLine} />
              <Text style={common.dividerText}>ou</Text>
              <View style={common.dividerLine} />
            </View>

            {/* Déclenche la fenêtre de connexion Google officielle */}
            <Button
              label="Continuer avec Google"
              onPress={() => promptAsync()}
              variant="social"
              size="full"
              icon={GOOGLE_ICON}
              disabled={!request}
            />

            <Button
              label="Continuer avec Apple"
              onPress={() =>
                Alert.alert('Bientôt disponible', 'La connexion avec Apple arrive prochainement.')
              }
              variant="social"
              size="full"
              icon={APPLE_ICON}
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
  forgotText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 13,
  },
});