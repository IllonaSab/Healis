import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, Text } from 'react-native';
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

// Les 4 types de repas standards affichés sur le tableau de bord
const MEAL_TYPES = [
  { id: 'PETIT_DEJEUNER', label: 'Petit-déjeuner' },
  { id: 'DEJEUNER', label: 'Déjeuner' },
  { id: 'EN_CAS', label: 'En-cas' },
  { id: 'DINER', label: 'Dîner' },
];

// Convertit un objet Date JavaScript en format texte "AAAA-MM-JJ" attendu par l'API
function toDateStr(date) {
  if (typeof date === 'string') return date;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMood, setSelectedMood] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);

  // Redirige vers l'écran de connexion si aucun utilisateur n'est authentifié
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user]);

  // Charge les données du jour et vérifie la série de connexions dès que l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      fetchDataForDate(selectedDate);
      api.get('/stats/streak').then(data => {
        setStreak(data.streak);
        // Affiche un bandeau de félicitations temporaire (5s) tous les 7 jours consécutifs
        if (data.streak > 0 && data.streak % 7 === 0) {
          setShowStreak(true);
          setTimeout(() => setShowStreak(false), 5000);
        }
      }).catch(() => {});
    }
  }, [user]);

  // Récupère en parallèle les repas et l'humeur enregistrés pour la date sélectionnée
  const fetchDataForDate = async (date) => {
    try {
      setIsLoadingMeals(true);
      const dateStr = toDateStr(date);
      const [meals, emotions] = await Promise.all([
        api.get(`/meal-logs?date=${dateStr}`),
        api.get(`/emotion-logs?date=${dateStr}`),
      ]);
      setMealLogs(meals);
      setSelectedMood(emotions.length > 0 ? emotions[0].emotion : null);
    } catch (error) {
      console.error('Erreur chargement données:', error.message);
    } finally {
      setIsLoadingMeals(false);
    }
  };

  // Met à jour la date active lors d'un clic sur le calendrier et recharge les données associées
  const handleSelectDay = (date) => {
    setSelectedDate(date);
    setSelectedMood(null);
    setMealLogs([]);
    fetchDataForDate(date);
  };

  // Enregistre l'émotion choisie pour la journée sélectionnée
  const handleSelectMood = async (moodId) => {
    setSelectedMood(moodId);
    try {
      await api.post('/emotion-logs', {
        emotion: moodId,
        intensity: 5,
        date: toDateStr(selectedDate),
      });
    } catch (error) {
      console.error('Erreur sauvegarde émotion:', error.message);
    }
  };

  const getMealForType = (mealType) => mealLogs.find((m) => m.mealType === mealType);

  // Met à jour le repas existant (PATCH) ou en crée un nouveau s'il n'existait pas encore (POST)
  const handleUpdateMeal = async (mealType, newTitle, newDescription) => {
    const existing = getMealForType(mealType);
    if (existing) {
      const updated = await api.patch(`/meal-logs/${existing.id}`, { title: newTitle, description: newDescription });
      setMealLogs((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } else {
      const created = await api.post('/meal-logs', { mealType, title: newTitle, description: newDescription, eaten: false, date: toDateStr(selectedDate) });
      setMealLogs((prev) => [...prev, created]);
    }
  };

  // Coche ou décoche l'état "mangé" du repas (bascule l'état ou crée l'entrée)
  const handleMarkEaten = async (mealType) => {
    const existing = getMealForType(mealType);
    if (existing) {
      const updated = await api.patch(`/meal-logs/${existing.id}`, { eaten: !existing.eaten });
      setMealLogs((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } else {
      const created = await api.post('/meal-logs', { mealType, title: 'Repas non détaillé', eaten: true, date: toDateStr(selectedDate) });
      setMealLogs((prev) => [...prev, created]);
    }
  };

  // Message d'encouragement progressif en fonction de la durée de la série
  const getStreakMessage = () => {
    if (streak >= 21) return '🌟 Incroyable ! 3 semaines de suivi. Tu avances vraiment bien.';
    if (streak >= 14) return '✨ 2 semaines consécutives ! Tu prends soin de toi chaque jour.';
    return '🌱 Bravo ! 7 jours de suivi consécutifs. Continue dans cette lancée !';
  };

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent} />
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

        {/* Message d'encouragement affiché lors des paliers de régularité */}
        {showStreak && (
          <View style={styles.streakCard}>
            <Text style={styles.streakText}>{getStreakMessage()}</Text>
          </View>
        )}

        {isLoadingMeals ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <>
            <EmojiCard selectedMood={selectedMood} onSelectMood={handleSelectMood} />

            {/* Génère dynamiquement une carte pour chaque créneau de la journée */}
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

            <TrackerEau selectedDate={toDateStr(selectedDate)} />
          </>
        )}
      </ScrollView>

      <PhraseCard />
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
    paddingBottom: 180,
    gap: spacing.lg,
    alignItems: 'center',
  },
  streakCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#E8F5EC',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  streakText: {
    fontSize: 14,
    color: colors.accent,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
  },
});