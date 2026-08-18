// Palette de couleurs centralisée pour garantir la cohérence visuelle de l'application
export const colors = {
  // Couleurs primitives de base
  black: '#000000',
  gray: '#888888',
  green: '#15804C',
  white: '#FFFFFF',
  darkGray: '#555555',

  // Alias sémantiques : facilitent la maintenance et l'adaptation des composants
  background: '#F5F5F5',      // Fond général des écrans et conteneurs
  textPrimary: '#000000',     // Texte principal (titres, valeurs clés)
  textSecondary: '#888888',   // Texte secondaire (placeholders, sous-titres)
  accent: '#15804C',          // Couleur d'accentuation principale (boutons, sélections)
  green1: '#9bf888',          // Nuance verte claire pour états secondaires ou badges
  gold: '#F5C842',            // Bordures et ombres d'accentuation (ex: PhraseCard)
  goldLight: '#FFF3C4',       // Nuance dorée claire pour détails graphiques
};

// Grille d'espacement basée sur un multiple de 4/8 pour les marges (padding / margin / gap)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Rayons de bordure prédéfinis pour uniformiser l'arrondi des cartes, inputs et boutons
export const radius = {
  sm: 8,      // Légers arrondis (boutons compacts, tags)
  md: 14,     // Arrondi standard des cartes et conteneurs
  pill: 999,  // Arrondi complet de type pilule ou cercle parfait
};