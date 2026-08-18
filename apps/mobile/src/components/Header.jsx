import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Import statique de l'image du logo depuis les assets de l'application
const LOGO = require('../../assets/tabs/header-logo.png');

export default function Header() {
  return (
    <View style={styles.container}>
      {/* Affiche le logo avec 'contain' pour conserver son ratio d'aspect sans déformation */}
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
    alignItems: 'center',        // Centre horizontalement le logo
    justifyContent: 'flex-start', // Place le contenu vers le haut
    paddingTop: 8,
    borderBottomWidth: 1,         // Délimitation visuelle sous le bandeau
    borderBottomColor: colors.accent,
  },

  logo: {
    width: 285,
    height: 48,
  },
});