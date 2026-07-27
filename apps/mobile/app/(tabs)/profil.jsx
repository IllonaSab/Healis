import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing } from '../../src/theme/colors';
import { common } from '../../src/theme/commonStyles';
import Button from '../../src/components/Button';

export default function Profil() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
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

        {/* Infos */}
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
            <Text style={styles.infoLabel}>Plan</Text>
            <Text style={styles.infoValue}>{user?.plan || 'FREE'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Objectif</Text>
            <Text style={styles.infoValue}>{user?.objectif || '—'}</Text>
          </View>
        </View>

        {/* Ressources */}
        <View style={common.card}>
          <Text style={styles.sectionTitle}>Ressources</Text>
          <Text style={styles.resourceText}>
            Ligne d écoute spécialisée TCA
          </Text>
          <Text style={styles.resourceValue}>
            Anorexie Boulimie Info Soins
          </Text>
          <Text style={styles.resourcePhone}>09 69 325 900</Text>
          <Text style={styles.resourceHours}>Lun-Ven 9h-17h</Text>
        </View>

        {/* Déconnexion */}
        <Button
          label="Se déconnecter"
          onPress={handleLogout}
          variant="outline"
          size="full"
        />

        <Text style={styles.version}>Healis v1.0.0</Text>
      </ScrollView>
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
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
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
});
