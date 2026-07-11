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

function toDateStr(date) {
  if (typeof date === 'string') return date;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Dashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMood, setSelectedMood] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
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
      setMealLogs(meals);
      setSelectedMood(emotions.length > 0 ? emotions[0].emotion : null);
    } catch (error) {
      console.error('Erreur chargement données:', error.message);
    } finally {
      setIsLoadingMeals(false);
    }
  };

  useEffect(() => {
    if (user) fetchDataForDate(selectedDate);
  }, [user]);

  const handleSelectDay = (date) => {
    setSelectedDate(date);
    setSelectedMood(null);
    setMealLogs([]);
    fetchDataForDate(date);
  };

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

  const getMealForType = (mealType) =>
    mealLogs.find((m) => m.mealType === mealType);

  const handleUpdateMeal = async (mealType, newTitle, newDescription) => {
    const existing = getMealForType(mealType);
    if (existing) {
      const updated = await api.patch(`/meal-logs/${existing.id}`, {
        title: newTitle,
        description: newDescription,
      });
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
      setMealLogs((prev) => [...prev, created]);
    }
  };

  const handleMarkEaten = async (mealType) => {
    const existing = getMealForType(mealType);
    if (existing) {
      const updated = await api.patch(`/meal-logs/${existing.id}`, {
        eaten: !existing.eaten,
      });
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
      setMealLogs((prev) => [...prev, created]);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
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
        
        {isLoadingMeals ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <>
            <EmojiCard
              selectedMood={selectedMood}
              onSelectMood={handleSelectMood}
            />

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

            

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Se déconnecter</Text>
              </TouchableOpacity>
             
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
