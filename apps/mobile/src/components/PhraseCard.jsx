import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';

// Liste de 7 phrases bienveillantes locales correspondant aux 7 jours de la semaine (0 = Dimanche à 6 = Samedi)
const FALLBACK_PHRASES = [
  "Tu fais du mieux que tu peux, et c'est suffisant.",
  "Chaque journée est une nouvelle chance de prendre soin de toi.",
  "Tu n'es pas seul(e) dans ce chemin.",
  "La guérison n'est pas linéaire, et c'est normal.",
  "Tu mérites la douceur, surtout de toi-même.",
  "Un petit pas aujourd'hui, c'est déjà une victoire.",
  "Ton corps fait de son mieux pour toi, chaque jour.",
];

export default function PhraseCard() {
  // Initialise immédiatement l'état avec la phrase locale du jour pour éviter tout écran vide ou délai visuel
  const [phrase, setPhrase] = useState(FALLBACK_PHRASES[new Date().getDay()]);

  console.log('PhraseCard phrase initiale:', FALLBACK_PHRASES[new Date().getDay()]);

  useEffect(() => {
    fetchPhrase();
  }, []);

  // Tente de récupérer la phrase personnalisée depuis l'API backend
  const fetchPhrase = async () => {
    try {
      const day = new Date().getDay();
      const data = await api.get(`/phrases?day=${day}`);

      // Met à jour la phrase uniquement si le serveur renvoie un contenu valide
      if (data.content) setPhrase(data.content);
    } catch (error) {
      // En cas de coupure réseau ou d'erreur serveur, l'application conserve la phrase de secours sans bloquer l'UI
    }
  };

  return (
    // 'pointerEvents="box-none"' permet aux clics de traverser le conteneur transparent pour atteindre les éléments en dessous
    <View style={styles.wrapper} pointerEvents="box-none">
      {/* Bulle de dialogue flottante avec ombre dorée */}
      <View style={styles.bubble}>
        <Text style={styles.text}>{phrase}</Text>
      </View>

      {/* Pointe de la bulle de dialogue */}
      <View style={styles.tail} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 106,
    right: 16,
    alignItems: 'flex-end',
  },
  bubble: {
    backgroundColor: colors.accent,
    borderRadius: 18,
    borderBottomRightRadius: 4, // Coin inférieur droit aplati pour donner l'effet bulle de bande dessinée
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