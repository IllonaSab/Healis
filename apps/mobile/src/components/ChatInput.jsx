import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors, spacing } from '../theme/colors';

export default function ChatInput({ value, onChangeText, onSend, disabled }) {
  return (
    <View style={styles.wrapper}>
      {/* Champ de saisie multiligne contrôlé avec limite de 500 caractères */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Écris ce que tu ressens..."
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={500}
        textAlignVertical="center"
      />

      {/* Bouton d'envoi rond avec désactivation dynamique si le texte est vide ou en cours de chargement */}
      <TouchableOpacity
        style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={disabled}
        activeOpacity={0.8}
        // Accessibilité pour les lecteurs d'écran
        accessible={true}
        accessibilityLabel="Envoyer le message"
        accessibilityRole="button"
      >
        <Image
          source={require('../../assets/tabs/button.png')}
          style={styles.sendIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    // Marge basse adaptée selon l'OS pour compenser la hauteur de la barre d'onglets
    paddingBottom: Platform.OS === 'ios' ? 90 : 95,
  },
  input: {
    flex: 1,
    maxHeight: 40,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A0C4B4',
  },
  sendIcon: {
    width: 24,
    height: 24,
    tintColor: colors.white,
  },
});