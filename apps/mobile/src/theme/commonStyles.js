import { StyleSheet } from 'react-native';
import { colors, spacing } from './colors';

export const common = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
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
  switchText: {
    textAlign: 'center',
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 4,
  },
  logo: {
    width: 285,
    height: 48,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
