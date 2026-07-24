import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';

export default function Profil() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Écran simple placeholder pour le futur espace Profil */}
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.subtitle}>Bientôt disponible...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    // Centre le contenu verticalement et horizontalement
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    // Titre principal
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    // Petit texte d’information
  },
});
