  import React, { useState } from 'react';
  import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
  import { colors } from '../theme/colors';

  const DAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  // Abréviations des jours (Dimanche → Samedi)

  const MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];
  // Liste des mois pour le sélecteur

  function dateToStr(date) {
    // Convertit une date en format YYYY-MM-DD
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }


  function getWeekDays(referenceDate) {
    // Calcule les 7 jours de la semaine autour d'une date donnée
    const date = new Date(referenceDate);
    const day = date.getDay();

    const monday = new Date(date);
    monday.setDate(date.getDate() - ((day + 6) % 7));
    // Trouve le lundi de la semaine

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        label: DAY_LABELS[d.getDay()], // Lettre du jour
        date: d.getDate(),            // Numéro du jour
        str: dateToStr(d),            // Format YYYY-MM-DD
      };
    });
  }


  const CURRENT_YEAR = new Date().getFullYear();
  // Année actuelle

  const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 5 + i);
  // Plage de 10 ans pour le sélecteur (5 avant, 5 après)


  export default function Calendrier({ onSelectDay }) {
    const today = new Date();
    const todayStr = dateToStr(today);

    const [weekOffset, setWeekOffset] = useState(0);
    // Décalage en semaines (−1 = semaine précédente, +1 = suivante)

    const [selectedStr, setSelectedStr] = useState(todayStr);
    // Jour sélectionné

    const [showPicker, setShowPicker] = useState(false);
    // Affichage du modal mois/année

    const [pickerMonth, setPickerMonth] = useState(today.getMonth());
    const [pickerYear, setPickerYear] = useState(today.getFullYear());
    // Valeurs du sélecteur

    const referenceDate = new Date(today);
    referenceDate.setDate(today.getDate() + weekOffset * 7);
    // Calcule la date de référence selon le décalage

    const days = getWeekDays(referenceDate);
    // Récupère les 7 jours de la semaine affichée


  const monthLabel = days[3].str
    ? new Date(days[3].str + 'T12:00:00').toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      })
    : '';
  // Affiche le mois/année basé sur le milieu de la semaine (jour 3)


  const handleSelect = (day) => {
    // Sélection d’un jour dans la semaine
    setSelectedStr(day.str);
    onSelectDay?.(day.str);
  };


  const handlePickerConfirm = () => {
    // Validation du sélecteur mois/année
    const target = new Date(pickerYear, pickerMonth, 1, 12, 0, 0);

    const diff = Math.round((target - today) / (7 * 24 * 60 * 60 * 1000));
    // Convertit la différence en semaines

    setWeekOffset(diff);

    const targetStr = dateToStr(target);
    setSelectedStr(targetStr);
    onSelectDay?.(targetStr);

    setShowPicker(false);
  };


  return (
    <View style={styles.container}>

      {/* --- En‑tête : affichage du mois + ouverture du sélecteur --- */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <Text style={styles.monthLabel}>{monthLabel} ▾</Text>
        </TouchableOpacity>
      </View>

      {/* --- Ligne de navigation hebdomadaire ( <-- semaine / jours / semaine -->) --- */}
      <View style={styles.weekRow}>

        {/* Flèche semaine précédente */}
        <TouchableOpacity
          onPress={() => setWeekOffset((o) => o - 1)}
          hitSlop={8} // augmente la zone cliquable
        >
          <Text style={styles.arrow}>{'<'}</Text>
        </TouchableOpacity>

        {/* Jours de la semaine */}
        <View style={styles.daysRow}>
          {days.map((day, i) => {
            const isSelected = day.str === selectedStr; // jour sélectionné
            const isToday = day.str === todayStr;       // jour actuel

            return (
              <View key={i} style={styles.dayColumn}>
                {/* Lettre du jour (L, M, J...) */}
                <Text style={styles.dayLabel}>{day.label}</Text>

                {/* Cercle du jour */}
                <TouchableOpacity
                  style={[
                    styles.dateCircle,
                    isSelected && styles.dateCircleSelected, // style si sélectionné
                    !isSelected && isToday && styles.dateCircleToday, // style si aujourd’hui
                  ]}
                  onPress={() => handleSelect(day)}
                  activeOpacity={0.7}
                >
                  {/* Numéro du jour */}
                  <Text
                    style={[
                      styles.dateText,
                      isSelected && styles.dateTextSelected,
                      !isSelected && isToday && styles.dateTextToday,
                    ]}
                  >
                    {day.date}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

          {/* Flèche semaine suivante */}
        <TouchableOpacity
          onPress={() => setWeekOffset((o) => o + 1)}
          hitSlop={8}
        >
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
        </View>

        <View style={styles.divider} />
  {/* Ligne de séparation entre le calendrier et le sélecteur */}

  <Modal visible={showPicker} animationType="slide" transparent>
    {/* Modal plein écran, transparent, qui glisse depuis le bas */}

    <View style={styles.modalOverlay}>
      {/* Fond semi‑transparent pour assombrir l’arrière‑plan */}

      <View style={styles.modalContent}>
        {/* Contenu du modal : carte blanche arrondie */}

        <Text style={styles.modalTitle}>Aller à...</Text>
        {/* Titre du sélecteur */}

        <View style={styles.pickerRow}>
          {/* Deux colonnes : Mois / Année */}

          {/* --- Colonne des mois --- */}
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Mois</Text>

            <FlatList
              data={MONTHS}
              keyExtractor={(_, i) => String(i)}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              // Liste scrollable des mois

              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    pickerMonth === index && styles.listItemSelected,
                    // Style si le mois est sélectionné
                  ]}
                  onPress={() => setPickerMonth(index)}
                >
                  <Text
                    style={[
                      styles.listItemText,
                      pickerMonth === index && styles.listItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* --- Colonne des années --- */}
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Année</Text>

            <FlatList
              data={YEARS}
              keyExtractor={(item) => String(item)}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              // Liste scrollable des années

              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    pickerYear === item && styles.listItemSelected,
                  ]}
                  onPress={() => setPickerYear(item)}
                >
                  <Text
                    style={[
                      styles.listItemText,
                      pickerYear === item && styles.listItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>

        {/* --- Bouton de confirmation --- */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handlePickerConfirm}
        >
          <Text style={styles.confirmText}>Confirmer</Text>
        </TouchableOpacity>

        {/* --- Bouton d’annulation --- */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setShowPicker(false)}
        >
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>

      </View>
    </View>
  </Modal>
  </View>
  );

  }

  const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    gap: 10,
    padding: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, 
  },
    monthLabel: {
      fontSize: 16,
      color: colors.accent,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    weekRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    arrow: {
      fontSize: 16,
      color: colors.textSecondary,
      paddingHorizontal: 2,
    },
    daysRow: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dayColumn: { alignItems: 'center', gap: 4 },
    dayLabel: { fontSize: 11, color: colors.textSecondary },
    dateCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateCircleSelected: {
        backgroundColor: colors.accent,
      },
      dateCircleToday: {
        borderWidth: 1.5,
        borderColor: colors.accent,
      },
      dateText: {
        fontSize: 13,
        color: colors.darkGray,
      },
      dateTextSelected: {
        color: colors.white,
        fontWeight: '700',
      },
      dateTextToday: {
        color: colors.accent,
        fontWeight: '700',
      },
      divider: {
        height: 1,
        backgroundColor: colors.accent,
        width: '100%',
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
      },
      modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        gap: 16,
      },
      modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
      },
      pickerRow: {
        flexDirection: 'row',
        gap: 16,
      },
      pickerColumn: {
        flex: 1,
        gap: 8,
      },
      pickerLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        textAlign: 'center',
      },
      list: {
        height: 180,
      },
      listItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
      },
      listItemSelected: {
        backgroundColor: '#E8F5EC',
      },
      listItemText: {
        fontSize: 14,
        color: colors.darkGray,
      },
      listItemTextSelected: {
        color: colors.accent,
        fontWeight: '700',
      },
      confirmButton: {
        backgroundColor: colors.accent,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
      },
      confirmText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '700',
      },
      cancelButton: {
        alignItems: 'center',
        paddingVertical: 8,
      },
      cancelText: {
        color: colors.textSecondary,
        fontSize: 14,
      },
    });
    