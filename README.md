# Healis — Application mobile de suivi pour personnes atteintes de TCA

## Présentation

Healis est une application mobile React Native dédiée au suivi émotionnel et nutritionnel pour les personnes en rétablissement de troubles du comportement alimentaire (TCA).

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Mobile | React Native (Expo SDK 54) |
| Backend | Node.js + Express 5 |
| Base de données | PostgreSQL 17 + Prisma 7 |
| IA | Mistral AI (mistral-small-latest) |
| Déploiement | Render |
| CI/CD | GitHub Actions |

---

## Structure du projet

```
HealIs/
├── apps/
│   ├── back/                    # Backend Express
│   │   ├── src/
│   │   │   ├── __tests__/       # Tests Jest
│   │   │   ├── middlewares/     # Auth JWT
│   │   │   ├── routes/          # API routes
│   │   │   └── index.js
│   │   └── prisma/schema.prisma
│   └── mobile/                  # App React Native
│       ├── app/                 # Expo Router
│       └── src/                 # Composants, services, theme
├── .github/workflows/ci.yml     # CI/CD
├── SECURITY.md
└── package.json
```

---

## Installation locale

```bash
git clone https://github.com/IllonaSab/Healis.git
cd Healis
npm install

# Backend
cd apps/back
cp .env.example .env   # Remplir DATABASE_URL, JWT_SECRET, MISTRAL_API_KEY, PORT
npx prisma db push
npx prisma generate
npx nodemon src/index.js

# Mobile (autre terminal)
cd apps/mobile
npx expo start
```

---

## Déploiement (Render)

| Paramètre | Valeur |
|-----------|--------|
| Root Directory | `apps/back` |
| Build Command | `npm install && npx prisma generate` |
| Start Command | `node src/index.js` |
| PORT | `10000` |

**URL de production** : `https://healis-qwss.onrender.com`

---

## Tests

```bash
$env:NODE_OPTIONS="--experimental-vm-modules"
$env:DATABASE_URL="postgresql://..."
$env:JWT_SECRET="..."
npx jest --testPathPatterns=apps/back/src/__tests__ --rootDir=apps/back
```

**Résultats** : 14 tests passés (auth, mealLogs, emotionLogs)

---

## Sécurité et accessibilité

Voir [SECURITY.md](./SECURITY.md)

