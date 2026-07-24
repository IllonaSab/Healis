import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';

const BOTTLE_ICON = require('../../assets/eau/bouteille.png');
const STEP = 0.5;

export default function TrackerEau({ selectedDate = new Date() }) {
  const [amount, setAmount] = useState(0);
  // Quantité totale d’eau bue (en litres)

  const [logs, setLogs] = useState([]);
  // Historique des ajouts (chaque log = +STEP)

  useEffect(() => {
    fetchToday();
  }, [selectedDate]);
  // Recharge les données quand la date change


  const fetchToday = async () => {
    try {
      const dateStr =
        typeof selectedDate === 'string'
          ? selectedDate
          : `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`;
      // Format YYYY-MM-DD si la date n’est pas déjà une string

      const data = await api.get(`/tracker-logs?date=${dateStr}`);
      // Récupère total + liste des logs pour la date

      setAmount(data.total);
      setLogs(data.logs);
    } catch (error) {
      // En cas d’erreur : on ne modifie rien
    }
  };


    const increment = async () => {
    const next = parseFloat((amount + STEP).toFixed(1));
    setAmount(next);
    // Mise à jour optimiste de l’UI

    try {
      const log = await api.post('/tracker-logs', { amount: STEP });
      // Enregistre un nouveau log côté backend

      setLogs((prev) => [...prev, log]);
      // Ajoute le log localement
    } catch (error) {
      setAmount(amount);
      // Si erreur : rollback
    }
  };


    const decrement = async () => {
    if (amount <= 0 || logs.length === 0) return;
    // Impossible de retirer si rien n’a été ajouté

    const lastLog = logs[logs.length - 1];
    // On retire toujours le dernier log ajouté

    const next = parseFloat((amount - STEP).toFixed(1));
    setAmount(Math.max(0, next));
    setLogs((prev) => prev.slice(0, -1));
    // Mise à jour optimiste

    try {
      await api.delete(`/tracker-logs/${lastLog.id}`);
      // Supprime le log côté backend
    } catch (error) {
      // Rollback si erreur
      setAmount(amount);
      setLogs((prev) => [...prev, lastLog]);
    }
  };


    return (
    <View style={styles.container}>
      <Text style={styles.title}>Hydratation — {amount}L / 2L</Text>
      {/* Affiche la progression du jour */}

      <View style={styles.row}>

        {/* Bouton - */}
        <TouchableOpacity
          style={styles.button}
          onPress={decrement}
          activeOpacity={0.7}
          disabled={amount <= 0}
          accessible={true}
          accessibilityLabel="Retirer 0.5 litre d'eau"
          accessibilityRole="button"
          accessibilityState={{ disabled: amount <= 0 }}
        >
          <Text style={[styles.buttonText, amount <= 0 && styles.buttonTextDisabled]}>-</Text>
        </TouchableOpacity>

        {/* Bouteille + quantité */}
        <View
          style={styles.bottleColumn}
          accessible={true}
          accessibilityLabel={`Quantité d'eau bue : ${amount} litres sur 2 litres`}
        >
          <Image
            source={BOTTLE_ICON}
            style={styles.bottleImage}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Bouteille d'eau"
            accessibilityRole="image"
          />
          <Text style={styles.amountLabel}>Eau {amount}L</Text>
        </View>

        {/* Bouton + */}
        <TouchableOpacity
          style={styles.button}
          onPress={increment}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Ajouter 0.5 litre d'eau"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    gap: 12,
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
  },
  buttonTextDisabled: {
    color: '#A0C4B4',
  },
  bottleColumn: {
    alignItems: 'center',
    gap: 6,
  },
  bottleImage: {
    width: 70,
    height: 74,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
