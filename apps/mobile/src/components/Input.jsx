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
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.gray}
      secureTextEntry={secureTextEntry}
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
