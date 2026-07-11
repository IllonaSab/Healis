import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { colors } from '../theme/colors';

const DAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function dateToStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getWeekDays(referenceDate) {
  const date = new Date(referenceDate);
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((day + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label: DAY_LABELS[d.getDay()],
      date: d.getDate(),
      str: dateToStr(d),
    };
  });
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 5 + i);

export default function Calendrier({ onSelectDay }) {
  const today = new Date();
  const todayStr = dateToStr(today);

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedStr, setSelectedStr] = useState(todayStr);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(today.getMonth());
  const [pickerYear, setPickerYear] = useState(today.getFullYear());

  const referenceDate = new Date(today);
  referenceDate.setDate(today.getDate() + weekOffset * 7);
  const days = getWeekDays(referenceDate);

const monthLabel = days[3].str
  ? new Date(days[3].str + 'T12:00:00').toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    })
  : '';

  const handleSelect = (day) => {
  setSelectedStr(day.str);
  onSelectDay?.(day.str);
};

  const handlePickerConfirm = () => {
    const target = new Date(pickerYear, pickerMonth, 1, 12, 0, 0);
    const diff = Math.round((target - today) / (7 * 24 * 60 * 60 * 1000));
    setWeekOffset(diff);
    const targetStr = dateToStr(target);
    setSelectedStr(targetStr);
    onSelectDay?.(targetStr);
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <Text style={styles.monthLabel}>{monthLabel} ▾</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        <TouchableOpacity onPress={() => setWeekOffset((o) => o - 1)} hitSlop={8}>
          <Text style={styles.arrow}>{'<'}</Text>
        </TouchableOpacity>

        <View style={styles.daysRow}>
          {days.map((day, i) => {
            const isSelected = day.str === selectedStr;
            const isToday = day.str === todayStr;
            return (
              <View key={i} style={styles.dayColumn}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <TouchableOpacity
                  style={[
                    styles.dateCircle,
                    isSelected && styles.dateCircleSelected,
                    !isSelected && isToday && styles.dateCircleToday,
                  ]}
                  onPress={() => handleSelect(day)}
                  activeOpacity={0.7}
                >
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

        <TouchableOpacity onPress={() => setWeekOffset((o) => o + 1)} hitSlop={8}>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <Modal visible={showPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Aller à...</Text>
            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Mois</Text>
                <FlatList
                  data={MONTHS}
                  keyExtractor={(_, i) => String(i)}
                  style={styles.list}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={[styles.listItem, pickerMonth === index && styles.listItemSelected]}
                      onPress={() => setPickerMonth(index)}
                    >
                      <Text style={[styles.listItemText, pickerMonth === index && styles.listItemTextSelected]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Année</Text>
                <FlatList
                  data={YEARS}
                  keyExtractor={(item) => String(item)}
                  style={styles.list}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.listItem, pickerYear === item && styles.listItemSelected]}
                      onPress={() => setPickerYear(item)}
                    >
                      <Text style={[styles.listItemText, pickerYear === item && styles.listItemTextSelected]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
            <TouchableOpacity style={styles.confirmButton} onPress={handlePickerConfirm}>
              <Text style={styles.confirmText}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPicker(false)}>
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
  