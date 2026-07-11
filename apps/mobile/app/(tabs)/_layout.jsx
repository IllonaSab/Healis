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

function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
   <View style={[styles.tabBarWrapper, { bottom: 20 }]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;
          const isFocused = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
                <Image
                  source={tab.icon}
                  style={styles.icon}
                  tintColor={isFocused ? colors.white : colors.darkGray}
                  resizeMode="contain"
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
      <View style={styles.content}>
        <Tabs
          tabBar={(props) => <TabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="chat" />
          <Tabs.Screen name="stats" />
          <Tabs.Screen name="profil" />
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
  header: {
    width: '100%',
    height: 64,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logo: {
    width: 285,
    height: 48,
  },
  content: {
    flex: 1,
  },
 tabBarWrapper: {
  position: 'absolute',
  left: 0,
  right: 0,
  alignItems: 'center',
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
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: colors.accent,
  },
  icon: {
    width: 18,
    height: 18,
  },
});
