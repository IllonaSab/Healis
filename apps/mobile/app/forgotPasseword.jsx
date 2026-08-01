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
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendCode = async () => {
  Alert.alert(
    'Fonctionnalité en cours',
    'La réinitialisation par email sera disponible en production avec un service email dédié (Resend).'
  );
};

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
      <KeyboardAvoidingView
        style={common.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={common.card}>
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
