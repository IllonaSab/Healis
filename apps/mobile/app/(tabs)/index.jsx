import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import Calendrier from '../../src/components/Calendrier';
import EmojiCard from '../../src/components/EmojiCard';
import RepasCard from '../../src/components/RepasCard';
import TrackerEau from '../../src/components/TrackerEau';
import PhraseCard from '../../src/components/PhraseCard';


import { colors, spacing } from '../../src/theme/colors';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

const MEAL_TYPES = [
  { id: 'PETIT_DEJEUNER', label: 'Petit-déjeuner' },
  { id: 'DEJEUNER', label: 'Déjeuner' },
  { id: 'EN_CAS', label: 'En-cas' },
  { id: 'DINER', label: 'Dîner' },
];
// Types de repas utilisés pour afficher et organiser les cartes


function toDateStr(date) {
  if (typeof date === 'string') return date;
  // Si déjà une string --> ne rien transformer

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
  // Convertit un objet Date en YYYY-MM-DD
}


export default function Dashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  // Contexte d’auth --> accès à l’utilisateur + logout

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();
  // Génère la date du jour au format YYYY-MM-DD

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMood, setSelectedMood] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);
  // États principaux du tableau de bord


  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      // Redirection si l’utilisateur n’est pas connecté
    }
  }, [authLoading, user]);


  const fetchDataForDate = async (date) => {
    try {
      setIsLoadingMeals(true);
      const dateStr = toDateStr(date);

      const [meals, emotions] = await Promise.all([
        api.get(`/meal-logs?date=${dateStr}`),
        api.get(`/emotion-logs?date=${dateStr}`),
      ]);
      // Charge repas + émotions en parallèle

      setMealLogs(meals);
      setSelectedMood(emotions.length > 0 ? emotions[0].emotion : null);
      // Sélectionne la première émotion du jour si existante
    } catch (error) {
      console.error('Erreur chargement données:', error.message);
    } finally {
      setIsLoadingMeals(false);
    }
  };


  useEffect(() => {
    if (user) fetchDataForDate(selectedDate);
    // Charge les données du jour dès que l’utilisateur est disponible
  }, [user]);


  const handleSelectDay = (date) => {
    setSelectedDate(date);
    setSelectedMood(null);
    setMealLogs([]);
    fetchDataForDate(date);
    // Réinitialise l’état et recharge les données pour la nouvelle date
  };


  const handleSelectMood = async (moodId) => {
    setSelectedMood(moodId);
    // Met à jour l’émotion sélectionnée localement

    try {
      await api.post('/emotion-logs', {
        emotion: moodId,
        intensity: 5,
        date: toDateStr(selectedDate),
      });
      // Sauvegarde l’émotion du jour
    } catch (error) {
      console.error('Erreur sauvegarde émotion:', error.message);
    }
  };


  const getMealForType = (mealType) =>
    mealLogs.find((m) => m.mealType === mealType);
  // Récupère le repas correspondant à un type donné


  const handleUpdateMeal = async (mealType, newTitle, newDescription) => {
    const existing = getMealForType(mealType);

    if (existing) {
      const updated = await api.patch(`/meal-logs/${existing.id}`, {
        title: newTitle,
        description: newDescription,
      });
      // Mise à jour d’un repas existant

      setMealLogs((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
    } else {
      const created = await api.post('/meal-logs', {
        mealType,
        title: newTitle,
        description: newDescription,
        eaten: false,
        date: toDateStr(selectedDate),
      });
      // Création d’un nouveau repas

      setMealLogs((prev) => [...prev, created]);
    }
  };


  const handleMarkEaten = async (mealType) => {
    const existing = getMealForType(mealType);

    if (existing) {
      const updated = await api.patch(`/meal-logs/${existing.id}`, {
        eaten: !existing.eaten,
      });
      // Toggle du statut "mangé"

      setMealLogs((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
    } else {
      const created = await api.post('/meal-logs', {
        mealType,
        title: 'Repas non détaillé',
        eaten: true,
        date: toDateStr(selectedDate),
      });
      // Création rapide d’un repas marqué comme mangé

      setMealLogs((prev) => [...prev, created]);
    }
  };


  const handleLogout = async () => {
    await logout();
    router.replace('/login');
    // Déconnexion + redirection
  };


  if (authLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent} />
        {/* Loader pendant la vérification de l’auth */}
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Calendrier onSelectDay={handleSelectDay} />
        {/* Sélection de la date */}

        {isLoadingMeals ? (
          <ActivityIndicator size="small" color={colors.accent} />
          // Loader pendant le chargement des repas
        ) : (
          <>
            <EmojiCard
              selectedMood={selectedMood}
              onSelectMood={handleSelectMood}
            />
            {/* Sélection de l’émotion du jour */}

            {MEAL_TYPES.map((meal) => {
              const log = getMealForType(meal.id);
              return (
                <RepasCard
                  key={meal.id}
                  mealLabel={meal.label}
                  status={log?.eaten ? 'Terminé' : 'Prévu'}
                  title={log?.title || 'Aucun repas renseigné'}
                  description={log?.description || ''}
                  eaten={!!log?.eaten}
                  onMarkEaten={() => handleMarkEaten(meal.id)}
                  onUpdateMeal={(title, desc) => handleUpdateMeal(meal.id, title, desc)}
                />
              );
            })}
            {/* Cartes des repas du jour */}

            <TrackerEau selectedDate={toDateStr(selectedDate)} />
            {/* Suivi de l’eau */}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
            {/* Bouton de déconnexion */}
          </>
        )}
      </ScrollView>

      <PhraseCard />
      {/* Phrase du jour */}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
    gap: spacing.lg,
    alignItems: 'center',
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: 'red',
    fontSize: 14,
  },
});
