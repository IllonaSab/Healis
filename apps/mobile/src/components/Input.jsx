import React, { useState } from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';

// Icônes de type switch/toggle pour basculer l'état
const TOGGLE_ON = require('../../assets/icons/ouvert.png');
const TOGGLE_OFF = require('../../assets/icons/fermer.png');

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
  // Gère l'affichage en clair ou masqué du texte sécurisé
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      {/* Champ de saisie paramétrable */}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          style,
          // Réserve de l'espace à droite si le bouton switch est présent
          secureTextEntry && styles.inputWithIcon,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray}
        // Masque le texte tant que le switch n'est pas activé (visible)
        secureTextEntry={secureTextEntry && !isVisible}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        autoFocus={autoFocus}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        accessible={true}
        accessibilityLabel={accessibilityLabel || placeholder}
        accessibilityRole="search"
      />

      {/* Bouton switch / toggle pour afficher ou masquer la saisie sécurisée */}
      {secureTextEntry && (
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsVisible((v) => !v)}
          accessible={true}
          accessibilityLabel={isVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          accessibilityRole="switch"
          accessibilityState={{ checked: isVisible }}
        >
          <Image
            source={isVisible ? TOGGLE_ON : TOGGLE_OFF}
            style={styles.toggleIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
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
  inputWithIcon: {
    paddingRight: 48, // Espace pour ne pas chevaucher le switch
  },
  multiline: {
    textAlignVertical: 'top',
  },
  toggleButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  toggleIcon: {
    width: 28,
    height: 28,
  },
});