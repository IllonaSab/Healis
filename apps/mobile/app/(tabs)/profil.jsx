import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing } from '../../src/theme/colors';
import { common } from '../../src/theme/commonStyles';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import { api } from '../../src/services/api';

export default function Profil() {
  const { user, logout, setUser } = useAuth();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Champs manquants', 'Tous les champs sont requis.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.patch('/auth/password', { currentPassword, newPassword });
      Alert.alert('Succès', 'Mot de passe modifié avec succès.');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePlan = async (plan) => {
    try {
      const data = await api.patch('/auth/plan', { plan });
      setUser({ ...user, plan });
      Alert.alert('Succès', `Plan mis à jour : ${plan}`);
      setShowPlanModal(false);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <SafeAreaView style={common.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.firstName || 'Utilisatrice'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>{user?.plan || 'FREE'}</Text>
          </View>
        </View>

        {/* Infos compte */}
        <View style={common.card}>
          <Text style={styles.sectionTitle}>Mon compte</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Prénom</Text>
            <Text style={styles.infoValue}>{user?.firstName || '—'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || '—'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Objectif</Text>
            <Text style={styles.infoValue}>{user?.objectif || '—'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plan</Text>
            <View style={styles.rowRight}>
              <Text style={styles.infoValue}>{user?.plan || 'FREE'}</Text>
              <TouchableOpacity onPress={() => setShowPlanModal(true)}>
                <Text style={styles.editLink}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => setShowPasswordModal(true)}
          >
            <Text style={styles.infoLabel}>Mot de passe</Text>
            <Text style={styles.editLink}>Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* Ressources */}
        <View style={common.card}>
          <Text style={styles.sectionTitle}>Ressources</Text>
          <Text style={styles.resourceText}>Ligne d écoute spécialisée TCA</Text>
          <Text style={styles.resourceValue}>Anorexie Boulimie Info Soins</Text>
          <Text style={styles.resourcePhone}>09 69 325 900</Text>
          <Text style={styles.resourceHours}>Lun-Ven 9h-17h</Text>
        </View>

        <Button
          label="Se déconnecter"
          onPress={handleLogout}
          variant="outline"
          size="full"
        />

        <Text style={styles.version}>Healis v1.0.0</Text>
      </ScrollView>

      {/* Modal mot de passe */}
      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le mot de passe</Text>

            <Input
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Mot de passe actuel"
              secureTextEntry
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
              label={isSubmitting ? '...' : 'Enregistrer'}
              onPress={handleChangePassword}
              disabled={isSubmitting}
              size="full"
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPasswordModal(false)}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal plan */}
      <Modal visible={showPlanModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Changer de plan</Text>

            <TouchableOpacity
              style={[styles.planOption, user?.plan === 'FREE' && styles.planOptionSelected]}
              onPress={() => handleChangePlan('FREE')}
            >
              <Text style={styles.planOptionTitle}>FREE</Text>
              <Text style={styles.planOptionDesc}>Suivi émotionnel, repas, hydratation, chat IA</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planOption, user?.plan === 'PREMIUM' && styles.planOptionSelected]}
              onPress={() => handleChangePlan('PREMIUM')}
            >
              <Text style={styles.planOptionTitle}>PREMIUM ✨</Text>
              <Text style={styles.planOptionDesc}>Toutes les fonctionnalités + suivi nutritionnel avec professionnel de santé</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPlanModal(false)}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 120,
  },
  avatarSection: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  planBadge: {
    backgroundColor: '#E8F5EC',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  planText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rowRight: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  editLink: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  resourceText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  resourceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  resourcePhone: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 4,
  },
  resourceHours: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  planOption: {
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 4,
  },
  planOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: '#E8F5EC',
  },
  planOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  planOptionDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
