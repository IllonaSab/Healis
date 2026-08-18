import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, spacing } from '../src/theme/colors';
import { common } from '../src/theme/commonStyles';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import { api } from '../src/services/api';

export default function ForgotPassword() {
  // Gère le passage entre l'étape 1 (saisie de l'email) et l'étape 2 (saisie du code et nouveau mot de passe)
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Étape 1 : envoie l'email au backend pour déclencher la génération et l'envoi du code par mail
  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Champ manquant', 'Entre ton adresse email.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      // Si la requête réussit, on bascule vers le formulaire de réinitialisation
      setStep(2);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Étape 2 : vérifie que le code correspond et enregistre le nouveau mot de passe
  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      Alert.alert('Champs manquants', 'Tous les champs sont requis.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      // Alerte de confirmation avec redirection automatique vers la connexion au clic
      Alert.alert('Succès', 'Mot de passe réinitialisé !', [
        { text: 'Se connecter', onPress: () => router.replace('/login') },
      ]);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={common.safeArea}>
      {/* Ajuste la position du formulaire sur iOS quand le clavier apparaît */}
      <KeyboardAvoidingView
        style={common.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={common.card}>
            {/* Affichage conditionnel selon l'étape actuelle */}
            {step === 1 ? (
              <>
                <Text style={common.screenTitle}>Mot de passe oublié</Text>
                <Text style={common.screenSubtitle}>
                  Entre ton adresse email — on t envoie un code de réinitialisation.
                </Text>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Adresse email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Button
                  label={isSubmitting ? '...' : 'Envoyer le code'}
                  onPress={handleSendCode}
                  disabled={isSubmitting}
                  size="full"
                />
              </>
            ) : (
              <>
                <Text style={common.screenTitle}>Nouveau mot de passe</Text>
                <Text style={common.screenSubtitle}>
                  Entre le code reçu par email et ton nouveau mot de passe.
                </Text>
                <Input
                  value={code}
                  onChangeText={setCode}
                  placeholder="Code à 6 caractères"
                  autoCapitalize="characters"
                  autoFocus
                />
                <Input
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nouveau mot de passe"
                  secureTextEntry
                />
                <Input
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirmer le mot de passe"
                  secureTextEntry
                />
                <Button
                  label={isSubmitting ? '...' : 'Réinitialiser'}
                  onPress={handleResetPassword}
                  disabled={isSubmitting}
                  size="full"
                />
              </>
            )}

            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={common.switchText}>Retour à la connexion</Text>
            </TouchableOpacity>
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
    padding: spacing.lg,
    gap: spacing.lg,
  },
});