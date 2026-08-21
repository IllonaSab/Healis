# Changelog — Healis

Toutes les modifications notables sont documentées dans ce fichier.
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/), versions selon [SemVer](https://semver.org/lang/fr/).

---

## [1.0.1] — 21 août 2026

### Sécurité
- Retrait de `apps/back/.env.test` du suivi git : le fichier contenait une chaîne de connexion Supabase
- Correction de la cause racine dans `apps/back/.gitignore` (une commande shell y avait été écrite au lieu d'être exécutée, l'exclusion n'avait jamais pris effet)
- Rotation complète des secrets : mot de passe Supabase, `JWT_SECRET`, révocation du token GitHub `healis-dev` (scope `repo`, sans expiration)
- Révocation vérifiée : ancienne chaîne de connexion rejetée (*authentication failed*), ancien token GitHub en `401`
- Non-régression contrôlée après propagation : `GET /health/db` renvoie `{"status":"ok","userCount":4}`

### Documentation
- Réécriture de `SECURITY.md` d'après un audit du code (OWASP Top 10 2021, RGPD, WCAG 2.2 AA)

---

## [1.0.0] — Août 2026

### Nouvelles fonctionnalités
- Inscription en 3 étapes avec objectif de guérison
- Dashboard avec calendrier, suivi émotionnel, repas et hydratation
- Chat IA "le jumeau du futur" alimenté par Mistral AI, encadré par un system prompt éthique
- Page Statistiques (émotions, hydratation, repas sur 7 jours)
- Page Profil (modification mot de passe, plan, ressources TCA)
- Paiement Stripe pour plan Premium (abonnement mensuel récurrent)
- Réinitialisation mot de passe via Resend (code 6 caractères, expiration 1 h)
- Streak 7 jours avec messages d'encouragement progressifs (7/14/21 jours)
- Route `GET /auth/me` pour rechargement des données utilisateur
- Bouton ↻ Rafraîchir le plan dans la page Profil
- Toggle afficher/masquer mot de passe dans les champs Input
- Composant `ChatInput` réutilisable, `paddingBottom` adapté par plateforme
- Configuration Google OAuth finalisée pour iOS et Android (`androidClientId` + SHA-1) — activation du bouton conditionnée à un build natif EAS

### Correctifs
- BUG-001 : Plan non mis à jour après paiement Stripe → ajout route `/auth/me` + bouton ↻
- BUG-002 : Décalage fuseau horaire → remplacement de `toISOString()` par `getFullYear()`/`getMonth()`/`getDate()`
- BUG-003 : Token invalide après migration Supabase → seul le schéma avait été migré, pas les données ; message d'erreur explicite et procédure de reconnexion documentée
- BUG-004 : Import `color` au lieu de `colors` dans `forgotPasseword.jsx` → correction de l'import
- BUG-005 : `authMiddleware` en double sur les routes payment → suppression du doublon dans `index.js`
- BUG-006 : `StyleSheet.create()` mal placé dans `index.jsx` → déplacement en dehors du composant
- BUG-007 : `ChatInput` caché sous la tab bar iOS/Android → composant dédié avec `paddingBottom` adapté
- BUG-008 : Google OAuth Android, `androidClientId` manquant → création du client OAuth Android + SHA-1 via EAS CLI

### Infrastructure
- Migration base de données Render → Supabase (Session Pooler, région `eu-west-3` Paris)
- Ajout des routes de supervision `GET /health` et `GET /health/db`
- Configuration cron-job.org (ping toutes les 10 min sur `/health`)
- CI/CD GitHub Actions avec PostgreSQL de test intégré
- Déploiement backend sur Render (healis-qwss.onrender.com)

### Sécurité
- Hashage bcrypt (salt 10) pour tous les mots de passe
- JWT signé avec un secret de 256 bits, expiration 7 jours
- Stockage du token via `expo-secure-store` (Keychain iOS / Keystore Android)
- Middleware de journalisation structurée JSON sur toutes les routes backend, sans `body` ni `headers`
- Variables sensibles en `.env` local et Render Environment, hors du dépôt

### Accessibilité
- Props WCAG 2.2 sur `Button`, `Input`, `EmojiCard`, `TrackerEau` et `ChatInput`
- Ratio de contraste `#15804C` sur blanc : 4,97:1 (conforme AA, critère 1.4.3)
- Information jamais portée par la couleur seule sur `EmojiCard` (image + libellé + état), critère 1.4.1

---

## [0.9.0] — Juillet 2026

### Nouvelles fonctionnalités
- Architecture monorepo avec npm workspaces
- Backend Express + Prisma + PostgreSQL
- Authentification JWT (register, login, infrastructure Google OAuth)
- Composants réutilisables (Button, Input, commonStyles)
- Tab bar custom avec icônes Figma
- PhraseCard connectée au backend `/phrases`
- 14 tests unitaires Jest (auth, mealLogs, emotionLogs)

### Infrastructure
- Déploiement initial sur Render
- Base de données PostgreSQL Render (migrée vers Supabase en v1.0.0)
