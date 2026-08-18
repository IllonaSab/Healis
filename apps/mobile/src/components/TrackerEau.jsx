import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';

const BOTTLE_ICON = require('../../assets/eau/bouteille.png');
// Pas d'incrément/décrément : chaque clic ajoute ou retire 0.5 litre
const STEP = 0.5;

export default function TrackerEau({ selectedDate = new Date() }) {
  // Volume total d'eau consommé dans la journée
  const [amount, setAmount] = useState(0);

  // Liste ordonnée des entrées d'eau (permet d'identifier l'id du dernier ajout pour le supprimer en cas de décrément)
  const [logs, setLogs] = useState([]);

  // Recharge l'état de l'hydratation dès que la date sélectionnée change dans le Dashboard
  useEffect(() => {
    fetchToday();
  }, [selectedDate]);

  const fetchToday = async () => {
    try {
      const dateStr =
        typeof selectedDate === 'string'
          ? selectedDate
          : `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`;

      const data = await api.get(`/tracker-logs?date=${dateStr}`);
      setAmount(data.total);
      setLogs(data.logs);
    } catch (error) {
      // En cas d'erreur de chargement, on conserve l'état local actuel
    }
  };

  // Ajout d'eau : mise à jour optimiste instantanée + enregistrement POST côté serveur
  const increment = async () => {
    const next = parseFloat((amount + STEP).toFixed(1));
    setAmount(next);

    try {
      const log = await api.post('/tracker-logs', { amount: STEP });
      setLogs((prev) => [...prev, log]);
    } catch (error) {
      // Annulation en cas d'échec de la requête réseau
      setAmount(amount);
    }
  };

  // Retrait d'eau : supprime le dernier log via un DELETE sur son identifiant unique
  const decrement = async () => {
    if (amount <= 0 || logs.length === 0) return;

    const lastLog = logs[logs.length - 1];
    const next = parseFloat((amount - STEP).toFixed(1));

    // Met à jour visuellement l'interface sans attendre la réponse HTTP
    setAmount(Math.max(0, next));
    setLogs((prev) => prev.slice(0, -1));

    try {
      await api.delete(`/tracker-logs/${lastLog.id}`);
    } catch (error) {
      // Rollback si le serveur renvoie une erreur
      setAmount(amount);
      setLogs((prev) => [...prev, lastLog]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Intitulé avec jauge d'objectif (2L) */}
      <Text style={styles.title}>Hydratation — {amount}L / 2L</Text>

      <View style={styles.row}>
        {/* Bouton décrément (-) désactivé à 0L */}
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

        {/* Illustration centrale et affichage textuel de la quantité */}
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

        {/* Bouton incrément (+) */}
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