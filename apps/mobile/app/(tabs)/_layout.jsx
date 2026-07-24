import { Tabs } from 'expo-router';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';

const LOGO = require('../../assets/tabs/header-logo.png');

const TABS = [
  { name: 'index', icon: require('../../assets/tabs/home.png'), label: 'Accueil' },
  { name: 'chat', icon: require('../../assets/tabs/chatbot.png'), label: 'Jumeau' },
  { name: 'stats', icon: require('../../assets/tabs/stat.png'), label: 'Stats' },
  { name: 'profil', icon: require('../../assets/tabs/profil.png'), label: 'Profil' },
];
// Configuration des onglets : nom de la route + icône + label


function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  // Permet d’adapter la barre aux zones sécurisées (iPhone, Android)

  return (
    <View style={[styles.tabBarWrapper, { bottom: 20 }]}>
      {/* Positionne la barre flottante au-dessus du bas de l’écran */}

      <View style={styles.container}>
        {/* Conteneur arrondi + ombre → style de la barre */}

        {state.routes.map((route, index) => {
          const tab = TABS.find((t) => t.name === route.name);
          // Associe chaque route à sa config d’onglet

          if (!tab) return null;

          const isFocused = state.index === index;
          // Détermine si l’onglet est actif

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.7}
              // Navigation vers l’onglet sélectionné
            >
              <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
                {/* Cercle autour de l’icône → coloré si actif */}

                <Image
                  source={tab.icon}
                  style={styles.icon}
                  tintColor={isFocused ? colors.white : colors.darkGray}
                  resizeMode="contain"
                  // Icône → change de couleur selon l’état actif/inactif
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}


export default function TabsLayout() {
  return (
    <View style={styles.root}>
      {/* Conteneur principal */}

      <View style={styles.content}>
        {/* Zone où les écrans des tabs seront rendus */}

        <Tabs
          tabBar={(props) => <TabBar {...props} />}
          screenOptions={{ headerShown: false }}
          // Remplace la barre par défaut par notre TabBar custom
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="chat" />
          <Tabs.Screen name="stats" />
          <Tabs.Screen name="profil" />
          {/* Déclaration des écrans accessibles via les onglets */}
        </Tabs>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
  },

  tabBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    // Permet de centrer la barre flottante
  },

  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 50,
    width: 360,
    height: 81,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    // Style de la barre : arrondie, ombre, espacée
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Zone cliquable de chaque onglet
  },

  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    // Cercle autour de l’icône
  },

  iconWrapperActive: {
    backgroundColor: colors.accent,
    // Cercle coloré quand l’onglet est actif
  },

  icon: {
    width: 18,
    height: 18,
    // Taille de l’icône
  },
});
