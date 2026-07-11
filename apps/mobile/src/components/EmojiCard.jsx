import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';

const MOODS = [
  { id: 'excellent', image: require('../../assets/emojis/excellent.png'), label: 'Excellent' },
  { id: 'bien', image: require('../../assets/emojis/bien.png'), label: 'Bien' },
  { id: 'mitige', image: require('../../assets/emojis/mitige.png'), label: 'Mitigé(e)' },
  { id: 'triste', image: require('../../assets/emojis/triste.png'), label: 'Triste' },
];

export default function EmojiCard({ selectedMood, onSelectMood }) {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel="Comment te sens-tu aujourd'hui ?"
      accessibilityRole="radiogroup"
    >
      <Text style={styles.title}>Comment te sens-tu aujourd hui ?</Text>

      <View style={styles.moodsRow}>
        {MOODS.map((mood) => {
          const isSelected = mood.id === selectedMood;
          return (
            <TouchableOpacity
              key={mood.id}
              style={styles.moodColumn}
              onPress={() => onSelectMood?.(mood.id)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel={mood.label}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={[styles.emojiCircle, isSelected && styles.emojiCircleSelected]}>
                <Image source={mood.image} style={styles.emojiImage} resizeMode="contain" />
              </View>
              <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  moodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  moodColumn: {
    alignItems: 'center',
    gap: 6,
    width: 68,
  },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiCircleSelected: {
    borderColor: colors.accent,
    backgroundColor: '#E8F5EC',
  },
  emojiImage: {
    width: 36,
    height: 36,
  },
  moodLabel: {
    fontSize: 12,
    color: colors.darkGray,
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    width: '100%',
  },
});
