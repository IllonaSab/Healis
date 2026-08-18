import { StyleSheet } from 'react-native';
import { colors, spacing } from './colors';

// Styles globaux réutilisables à travers tous les écrans pour éviter la duplication de code
export const common = StyleSheet.create({
  // Conteneur principal plein écran respectant les zones sécurisées (encoches / barres système)
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },

  // Carte blanche standard avec ombrage doux (iOS shadow + Android elevation)
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Typographies d'en-tête d'écran
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Ligne de séparation avec texte au milieu (ex: "OU" entre connexion email et OAuth Google)
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Lien textuel de bascule d'écran (ex: "Pas encore de compte ? S'inscrire")
  switchText: {
    textAlign: 'center',
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },

  // Conteneur et dimensions standardisées pour le logo de l'application
  logoContainer: {
    alignItems: 'center',
    gap: 4,
  },
  logo: {
    width: 285,
    height: 48,
  },

  // Centrage rapide horizontal et vertical
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});