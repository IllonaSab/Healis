# Healis — Backend

API REST Node.js + Express pour l'application Healis.

## Installation

```bash
npm install
npx prisma db push
npx prisma generate
npx nodemon src/index.js
# → http://localhost:3000
```

## Variables d'environnement

```env
DATABASE_URL=postgresql://user:password@localhost:5433/healis
JWT_SECRET=votre_secret_jwt
MISTRAL_API_KEY=votre_cle_mistral
PORT=3000
```

## Routes API

| Route | Auth | Description |
|-------|------|-------------|
| POST /auth/register | Non | Inscription |
| POST /auth/login | Non | Connexion |
| GET/POST /emotion-logs | JWT | Suivi émotionnel |
| GET/POST/PATCH /meal-logs | JWT | Suivi des repas |
| GET/POST /tracker-logs | JWT | Hydratation |
| POST /chat | JWT | Chat IA Mistral |
| GET /phrases | Non | Phrase du jour |

## Tests

```bash
$env:NODE_OPTIONS="--experimental-vm-modules"
$env:DATABASE_URL="postgresql://..."
$env:JWT_SECRET="..."
npx jest --testPathPatterns=src/__tests__ --rootDir=.
```

**14 tests** — auth, mealLogs, emotionLogs