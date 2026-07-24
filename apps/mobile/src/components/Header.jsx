import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const LOGO = require('../../assets/tabs/header-logo.png');

export default function Header() {
  return (
    <View style={styles.container}>
      {/* Affichage du logo dans un header simple */}
      <Image
        source={LOGO}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: 100,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    // Header minimaliste : fond blanc + ligne d’accent en bas
  },

  logo: {
    width: 285,
    height: 48,
    // Dimensions fixes pour un rendu stable du logo
  },
});

