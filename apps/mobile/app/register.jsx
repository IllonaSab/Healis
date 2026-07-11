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

const OBJECTIFS = [
  { id: 'Reprendre confiance en soi', label: 'Reprendre confiance en soi' },
  { id: 'réconciliation avec la nourriture', label: 'Réconciliation avec la nourriture' },
  { id: 'Équilibre', label: 'Équilibre' },
];

export default function Register() {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [objectif, setObjectif] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (step === 1 && (!firstName || !email || !password)) {
      Alert.alert('Champs manquants', 'Tous les champs sont requis.');
      return;
    }
    setStep((prev) => prev + 1);
  };

    const handleRegister = async () => {
    setIsSubmitting(true);
    try {
        await register(email, password, firstName, objectif);
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

          <View style={styles.stepsRow}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={[styles.stepDot, s <= step && styles.stepDotActive]} />
            ))}
          </View>

          <View style={common.card}>
            {step === 1 && (
              <>
                <Text style={common.screenTitle}>Crée ton compte</Text>
                <Input value={lastName} onChangeText={setLastName} placeholder="Nom" autoCapitalize="words" />
                <Input value={firstName} onChangeText={setFirstName} placeholder="Prénom" autoCapitalize="words" />
                <Input value={email} onChangeText={setEmail} placeholder="Adresse email" autoCapitalize="none" keyboardType="email-address" />
                <Input value={password} onChangeText={setPassword} placeholder="Mot de passe" secureTextEntry />
                <Button label="Suivant" onPress={handleNext} size="full" />
                <TouchableOpacity onPress={() => router.replace('/login')}>
                  <Text style={common.switchText}>Déjà un compte ? Se connecter</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
            <>
                <Text style={styles.message}>Bienvenue {firstName}</Text>
                <Text style={common.screenSubtitle}>
                Ici, pas de jugement — juste un espace de bienveillance pour t accompagner dans ton parcours.
                </Text>
                <Button label="Suivant" onPress={handleNext} size="full" />
                <Button
                label="Retour"
                onPress={() => setStep(1)}
                variant="secondary"
                size="full"
                />
            </>
            )}

            {step === 3 && (
            <>
                <Text style={common.screenTitle}>Ton objectif</Text>
                <Text style={common.screenSubtitle}>
                Choisis l intention qui te fait le plus de sens aujourd hui.
                </Text>
                {OBJECTIFS.map((obj) => (
                <TouchableOpacity
                    key={obj.id}
                    style={[styles.objectifButton, objectif === obj.id && styles.objectifButtonSelected]}
                    onPress={() => setObjectif(obj.id)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.objectifText, objectif === obj.id && styles.objectifTextSelected]}>
                    {obj.label}
                    </Text>
                </TouchableOpacity>
                ))}
                <Button label={isSubmitting ? '...' : 'Commencer'} onPress={handleRegister} disabled={isSubmitting} size="full" />
                <Button label="Retour" onPress={() => setStep(2)} variant="secondary" size="full" />
            </>
            )}
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

  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5E5',
  },
  stepDotActive: {
    backgroundColor: colors.accent,
  },
  message: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    textAlign: 'center',
  },
  objectifButton: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  objectifButtonSelected: {
    borderColor: colors.accent,
    backgroundColor: '#E8F5EC',
  },
  objectifText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  objectifTextSelected: {
    color: colors.accent,
  },
});
