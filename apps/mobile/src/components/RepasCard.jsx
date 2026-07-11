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
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title || '');
  const [draftDescription, setDraftDescription] = useState(description || '');

  const handleOpen = () => {
    setDraftTitle(title || '');
    setDraftDescription(description || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (draftTitle.trim()) {
      onUpdateMeal?.(draftTitle.trim(), draftDescription.trim());
    }
    setIsEditing(false);
  };

  const isEmpty = !title || title === 'Aucun repas renseigné' || title === 'Repas non détaillé';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.mealLabel}>{mealLabel}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.status}>{status}</Text>
          <TouchableOpacity onPress={handleOpen} hitSlop={8}>
            <Text style={styles.editLink}>Modifier</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.descriptionRow} onPress={handleOpen} activeOpacity={0.7}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
        <View style={styles.descriptionText}>
          <Text style={[styles.title, isEmpty && styles.titleEmpty]}>
            {isEmpty ? 'Ajouter un aliment...' : title}
          </Text>
          {!isEmpty && description ? (
            <Text style={styles.subtitle}>{description}</Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <Button
        label={eaten ? 'Repas marqué comme mangé' : "J'ai mangé ce repas"}
        onPress={onMarkEaten}
        variant={eaten ? 'primaryDark' : 'primary'}
        size="full"
        disabled={isEditing}
      />

      <Modal visible={isEditing} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier — {mealLabel}</Text>

            <Text style={styles.inputLabel}>Nom du plat</Text>
            <Input
              value={draftTitle}
              onChangeText={setDraftTitle}
              placeholder="Ex: Porridge chocolat"
              autoFocus
            />

            <Text style={styles.inputLabel}>Ingrédients / description</Text>
            <Input
              value={draftDescription}
              onChangeText={setDraftDescription}
              placeholder="Ex: Flocons d'avoine, lait d'amande..."
              multiline
            />

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
