import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';

import Button from './Button';
import Input from './Input';

const DEFAULT_ICON = require('../../assets/repas/meal-icons.png');

export default function RepasCard({
  mealLabel = 'Petit-déjeuner',
  status = 'Prévu',
  title,
  description,
  icon = DEFAULT_ICON,
  eaten = false,
  onMarkEaten,
  onUpdateMeal,
}) {
  // Contrôle l'ouverture et la fermeture de la fenêtre modale de modification
  const [isEditing, setIsEditing] = useState(false);

  // États locaux temporaires pour ne pas modifier l'affichage tant que l'utilisateur n'a pas validé
  const [draftTitle, setDraftTitle] = useState(title || '');
  const [draftDescription, setDraftDescription] = useState(description || '');

  // Ouvre la modale et pré-remplit les champs avec les données actuelles
  const handleOpen = () => {
    setDraftTitle(title || '');
    setDraftDescription(description || '');
    setIsEditing(true);
  };

  // Envoie les modifications au parent (Dashboard) si le titre n'est pas vide
  const handleSave = () => {
    if (draftTitle.trim()) {
      onUpdateMeal?.(draftTitle.trim(), draftDescription.trim());
    }
    setIsEditing(false);
  };

  // Détecte si le repas a été renseigné ou s'il utilise un texte par défaut
  const isEmpty =
    !title ||
    title === 'Aucun repas renseigné' ||
    title === 'Repas non détaillé';

  return (
    <View style={styles.container}>
      {/* En-tête : Intitulé du créneau horaire, statut (Prévu/Terminé) et lien d'édition */}
      <View style={styles.headerRow}>
        <Text style={styles.mealLabel}>{mealLabel}</Text>

        <View style={styles.headerRight}>
          <Text style={styles.status}>{status}</Text>

          <TouchableOpacity onPress={handleOpen} hitSlop={8}>
            <Text style={styles.editLink}>Modifier</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Zone cliquable centrale : affiche l'icône, le titre et la description du repas */}
      <TouchableOpacity
        style={styles.descriptionRow}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Image
          source={icon}
          style={styles.icon}
          resizeMode="contain"
        />

        <View style={styles.descriptionText}>
          <Text style={[styles.title, isEmpty && styles.titleEmpty]}>
            {isEmpty ? 'Ajouter un aliment...' : title}
          </Text>

          {!isEmpty && description ? (
            <Text style={styles.subtitle}>{description}</Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* Bouton d'action pour marquer le repas comme pris (change de couleur et d'intitulé si déjà mangé) */}
      <Button
        label={eaten ? 'Repas marqué comme mangé' : "J'ai mangé ce repas"}
        onPress={onMarkEaten}
        variant={eaten ? 'primaryDark' : 'primary'}
        size="full"
        disabled={isEditing}
      />

      {/* Modale d'édition avec formulaire et remontée automatique au-dessus du clavier sur iOS */}
      <Modal visible={isEditing} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Modifier — {mealLabel}
            </Text>

            {/* Saisie du titre */}
            <Text style={styles.inputLabel}>Nom du plat</Text>
            <Input
              value={draftTitle}
              onChangeText={setDraftTitle}
              placeholder="Ex: Porridge chocolat"
              autoFocus
            />

            {/* Saisie détaillée des ingrédients ou notes */}
            <Text style={styles.inputLabel}>
              Ingrédients / description
            </Text>
            <Input
              value={draftDescription}
              onChangeText={setDraftDescription}
              placeholder="Ex: Flocons d'avoine, lait d'amande..."
              multiline
            />

            {/* Boutons d'action : validation et annulation */}
            <Button
              label="Enregistrer"
              onPress={handleSave}
              disabled={!draftTitle.trim()}
              size="full"
            />

            <Button
              label="Annuler"
              onPress={() => setIsEditing(false)}
              disabled={!draftTitle.trim()}
              size="full"
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mealLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  status: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  editLink: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '600',
  },
  descriptionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  icon: {
    width: 20,
    height: 20,
    marginTop: 2,
  },
  descriptionText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  titleEmpty: {
    fontWeight: '400',
    color: colors.gray,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 11,
    color: colors.darkGray,
    lineHeight: 15,
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
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    color: colors.textPrimary,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});