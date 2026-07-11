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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { request, promptAsync } = useGoogleAuth(async (accessToken) => {
    try {
      const data = await api.post('/auth/google', { accessToken });
      await saveToken(data.token);
      setUser(data.user);
      router.replace('/');
    } catch (error) {
      Alert.alert('Erreur Google', error.message);
    }
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Champs manquants', 'Email et mot de passe sont requis.');
      return;
    }
    setIsSubmitting(true);
    try {
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
            <Image source={require('../assets/tabs/header-logo.png')} style={common.logo} resizeMode="contain" />
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
              onPress={() => Alert.alert('Bientôt disponible', 'La connexion avec Apple arrive prochainement.')}
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
});
