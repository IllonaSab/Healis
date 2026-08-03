import React, { useState } from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';

const EYE_OPEN = require('../../assets/icons/ouvert.png');
const EYE_CLOSED = require('../../assets/icons/fermer.png');

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
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={[styles.input, multiline && styles.multiline, style, secureTextEntry && styles.inputWithIcon]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray}
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
      {secureTextEntry && (
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setIsVisible(v => !v)}
          accessible={true}
          accessibilityLabel={isVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          accessibilityRole="button"
        >
          <Image
            source={isVisible ? EYE_OPEN : EYE_CLOSED}
            style={styles.eyeIcon}
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
    paddingRight: 44,
  },
  multiline: {
    textAlignVertical: 'top',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  eyeIcon: {
    width: 30,
    height: 30,
  },
});
