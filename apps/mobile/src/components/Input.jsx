import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Input({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  numberOfLines,
  maxLength,
  autoFocus = false,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  style,
  accessibilityLabel,
}) {
  return (
    <TextInput
      style={[styles.input, multiline && styles.multiline, style]}
      // Style de base + style multiline + style personnalisé

      value={value}
      onChangeText={onChangeText}
      // Gestion du texte saisi

      placeholder={placeholder}
      placeholderTextColor={colors.gray}
      // Placeholder + couleur

      secureTextEntry={secureTextEntry}
      // Masque le texte (mot de passe)

      multiline={multiline}
      numberOfLines={numberOfLines}
      // Active le mode texte multi‑lignes

      maxLength={maxLength}
      // Limite de caractères

      autoFocus={autoFocus}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      // Paramètres de saisie (clavier, auto‑capitalisation, focus)

      accessible={true}
      accessibilityLabel={accessibilityLabel || placeholder}
      accessibilityRole="search"
      // Accessibilité : rôle "search" pour les lecteurs d’écran
    />
  );
}


const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  multiline: {
    textAlignVertical: 'top',
  },
});
