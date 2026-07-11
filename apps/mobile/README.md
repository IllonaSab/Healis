# Healis — Mobile

Application React Native (Expo SDK 54) pour le suivi émotionnel et nutritionnel.

## Installation

```bash
npm install
npx expo start
```

## Structure
src/
├── components/    # Button, Input, Calendrier, EmojiCard, RepasCard, TrackerEau, PhraseCard
├── context/       # AuthContext
├── hooks/         # useGoogleAuth
├── services/      # api.js
└── theme/         # colors.js, commonStyles.js

## Configuration

Dans `src/services/api.js`, définir l'URL du backend :
- **Local** : `http://TON_IP:3000`
- **Production** : `https://healis-qwss.onrender.com`

## Navigation

Expo Router avec tab bar custom — 4 onglets : Dashboard, Chat IA, Stats, Profil.