import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../src/theme/colors';
import { common } from '../../src/theme/commonStyles';
import { api } from '../../src/services/api';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const MOOD_COLORS = {
  excellent: '#15804C',
  bien: '#4CAF50',
  mitige: '#FF9800',
  triste: '#9E9E9E',
};

const MOOD_LABELS = {
  excellent: 'Excellent',
  bien: 'Bien',
  mitige: 'Mitigé(e)',
  triste: 'Triste',
};

function getLastSevenDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

export default function Stats() {
  const [isLoading, setIsLoading] = useState(true);
  const [emotionData, setEmotionData] = useState([]);
  const [waterData, setWaterData] = useState([]);
  const [mealData, setMealData] = useState([]);

  const days = getLastSevenDays();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const results = await Promise.all(
        days.map(async (date) => {
          const [emotions, water, meals] = await Promise.all([
            api.get(`/emotion-logs?date=${date}`).catch(() => []),
            api.get(`/tracker-logs?date=${date}`).catch(() => ({ total: 0 })),
            api.get(`/meal-logs?date=${date}`).catch(() => []),
          ]);
          return { date, emotions, water, meals };
        })
      );

      setEmotionData(results.map(r => ({
        date: r.date,
        mood: r.emotions.length > 0 ? r.emotions[0].emotion : null,
      })));

      setWaterData(results.map(r => ({
        date: r.date,
        total: r.water?.total || 0,
      })));

      setMealData(results.map(r => ({
        date: r.date,
        count: r.meals.filter(m => m.eaten).length,
      })));
    } catch (error) {
      console.error('Erreur stats:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const maxWater = Math.max(...waterData.map(d => d.total), 2);

  if (isLoading) {
    return (
      <SafeAreaView style={[common.safeArea, common.centered]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={common.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Mes 7 derniers jours</Text>
        <Text style={styles.subtitle}>Ton évolution cette semaine 🌱</Text>

        {/* Émotions */}
        <View style={common.card}>
          <Text style={styles.cardTitle}>Humeur de la semaine</Text>
          <View style={styles.moodRow}>
            {emotionData.map((item, i) => (
              <View key={item.date} style={styles.moodColumn}>
                <View
                  style={[
                    styles.moodDot,
                    { backgroundColor: item.mood ? MOOD_COLORS[item.mood] : '#E5E5E5' },
                  ]}
                />
                <Text style={styles.dayLabel}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            {Object.entries(MOOD_COLORS).map(([key, color]) => (
              <View key={key} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendText}>{MOOD_LABELS[key]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Hydratation */}
        <View style={common.card}>
          <Text style={styles.cardTitle}>Hydratation (litres)</Text>
          <View style={styles.barChart}>
            {waterData.map((item, i) => (
              <View key={item.date} style={styles.barColumn}>
                <Text style={styles.barValue}>
                  {item.total > 0 ? `${item.total}L` : ''}
                </Text>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max((item.total / maxWater) * 80, 4),
                        backgroundColor: item.total >= 2 ? colors.accent : '#A0C4B4',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.dayLabel}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.chartNote}>Objectif : 2L par jour</Text>
        </View>

        {/* Repas */}
        <View style={common.card}>
          <Text style={styles.cardTitle}>Repas notés</Text>
          <View style={styles.mealGrid}>
            {mealData.map((item, i) => (
              <View key={item.date} style={styles.mealColumn}>
                <View style={styles.mealDots}>
                  {Array.from({ length: 4 }, (_, j) => (
                    <View
                      key={j}
                      style={[
                        styles.mealDot,
                        { backgroundColor: j < item.count ? colors.accent : '#E5E5E5' },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.mealCount}>{item.count}/4</Text>
                <Text style={styles.dayLabel}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.chartNote}>Repas marqués comme mangés</Text>
        </View>

        <View style={styles.encouragement}>
          <Text style={styles.encouragementText}>
            Chaque jour compte, même les plus difficiles. Tu avances à ton rythme. 🌿
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 120,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  // Émotions
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  moodColumn: {
    alignItems: 'center',
    gap: 6,
  },
  moodDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  dayLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  // Hydratation
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
    marginBottom: spacing.sm,
  },
  barColumn: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  barWrapper: {
    height: 80,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: 16,
    borderRadius: 4,
    minHeight: 4,
  },
  chartNote: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  // Repas
  mealGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  mealColumn: {
    alignItems: 'center',
    gap: 4,
  },
  mealDots: {
    gap: 3,
  },
  mealDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 2,
  },
  mealCount: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  // Encouragement
  encouragement: {
    backgroundColor: '#E8F5EC',
    borderRadius: 12,
    padding: spacing.md,
  },
  encouragementText: {
    fontSize: 13,
    color: colors.accent,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
