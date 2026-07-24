import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';

const FALLBACK_PHRASES = [
  "Tu fais du mieux que tu peux, et c'est suffisant.",
  "Chaque journée est une nouvelle chance de prendre soin de toi.",
  "Tu n'es pas seul(e) dans ce chemin.",
  "La guérison n'est pas linéaire, et c'est normal.",
  "Tu mérites la douceur, surtout de toi-même.",
  "Un petit pas aujourd'hui, c'est déjà une victoire.",
  "Ton corps fait de son mieux pour toi, chaque jour.",
];
// Phrases par défaut selon le jour de la semaine (index = getDay())


export default function PhraseCard() {
  const [phrase, setPhrase] = useState(FALLBACK_PHRASES[new Date().getDay()]);
  // Phrase initiale basée sur le jour actuel

  console.log('PhraseCard phrase initiale:', FALLBACK_PHRASES[new Date().getDay()]);
  // Log utile pour vérifier le fallback

  useEffect(() => {
    fetchPhrase();
  }, []);
  // Appel API au montage du composant


   const fetchPhrase = async () => {
    try {
      const day = new Date().getDay();
      const data = await api.get(`/phrases?day=${day}`);
      // Récupère la phrase du backend pour le jour courant

      if (data.content) setPhrase(data.content);
      // Si le backend renvoie une phrase --> on remplace le fallback
    } catch (error) {
      // En cas d’erreur : on garde la phrase fallback déjà définie
    }
  };


  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {/* Bulle contenant la phrase */}
      <View style={styles.bubble}>
        <Text style={styles.text}>{phrase}</Text>
      </View>

      {/* Petit triangle sous la bulle */}
      <View style={styles.tail} />
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    alignItems: 'flex-end',
  },
  bubble: {
  backgroundColor: colors.accent,
  borderRadius: 18,
  borderBottomRightRadius: 4,
  paddingHorizontal: 14,
  paddingVertical: 10,
  maxWidth: 280,
  borderColor: colors.gold,
  borderWidth: 1,
  shadowColor: colors.gold,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.5,
  shadowRadius: 10,
  elevation: 6,
},
text: {
  fontSize: 14,
  color: colors.white,
  lineHeight: 20,
  fontStyle: 'italic',
},
tail: {
  borderTopColor: colors.goldLight,
},
});
