import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  size = 'md',
  icon,
  accessibilityLabel,
}) {
  return (
    <TouchableOpacity
      // Combine dynamiquement le style de base avec la variante, la taille et l'état actif/inactif
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        icon && styles.withIcon,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      // Paramètres d'accessibilité pour les lecteurs d'écran (TalkBack / VoiceOver)
      accessible={true}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {/* Affiche l'icône à gauche du texte si elle est fournie */}
      {icon && <Image source={icon} style={styles.icon} resizeMode="contain" />}

      {/* Applique la typographie et la couleur de texte adaptées à la variante */}
      <Text style={[styles.label, styles[`label_${variant}`]]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  withIcon: {
    flexDirection: 'row',
    gap: 8,
  },

  icon: {
    width: 20,
    height: 20,
  },

  // Variantes graphiques
  primary: {
    backgroundColor: colors.accent,
  },

  primaryDark: {
    backgroundColor: '#0F6E3A',
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },

  ghost: {
    backgroundColor: 'transparent',
  },

  social: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    flexDirection: 'row',
    gap: 8,
  },

  secondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  // Tailles
  size_sm: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  size_md: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  size_lg: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  size_full: {
    paddingVertical: 12,
    width: '100%',
  },

  // Typographies selon la variante
  label: {
    fontSize: 14,
    fontWeight: '700',
  },

  label_primary: {
    color: colors.white,
  },

  label_primaryDark: {
    color: colors.white,
  },

  label_outline: {
    color: colors.accent,
  },

  label_ghost: {
    color: colors.textSecondary,
  },

  label_social: {
    color: colors.textPrimary,
    fontWeight: '600',
  },

  label_secondary: {
    color: colors.textPrimary,
    fontWeight: '600',
  },

  disabled: {
    backgroundColor: '#A0C4B4',
  },
});