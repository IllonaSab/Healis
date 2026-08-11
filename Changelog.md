# Changelog — Healis

Toutes les modifications notables sont documentées dans ce fichier.
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.0.0] — Août 2026

### Nouvelles fonctionnalités
- Inscription en 3 étapes avec objectif de guérison
- Dashboard avec calendrier, suivi émotionnel, repas et hydratation
- Chat IA "le jumeau du futur" alimenté par Mistral AI
- Page Statistiques (émotions, hydratation, repas sur 7 jours)
- Page Profil (modification mot de passe, plan, ressources TCA)
- Paiement Stripe pour plan Premium
- Réinitialisation mot de passe via Resend
- Streak 7 jours avec messages d'encouragement progressifs (7/14/21 jours)
- Route /auth/me pour rechargement des données utilisateur
- Bouton ↻ Rafraîchir le plan dans la page Profil
- Toggle afficher/masquer mot de passe dans les champs Input

### Correctifs
- BUG-001 : Plan non mis à jour après paiement Stripe → ajout route /auth/me + bouton ↻
- BUG-002 : Décalage fuseau horaire → remplacement toISOString() par getFullYear()/getMonth()/getDate()
- BUG-003 : Token invalide après migration Supabase → fix SSL + reconnexion utilisateur
- BUG-004 : Styles StyleSheet mal placés dans index.jsx → déplacement en dehors du composant
- BUG-005 : Import color au lieu de colors dans forgotPasseword.jsx → correction import
- BUG-006 : authMiddleware en double sur routes payment → suppression du doublon

### Infrastructure
- Migration base de données Render → Supabase (Session Pooler, gratuit permanent)
- Configuration cron-job.org (ping toutes les 10 min sur /health)
- CI/CD GitHub Actions avec PostgreSQL de test intégré
- Déploiement backend sur Render (healis-qwss.onrender.com)

### Sécurité
- Hashage bcrypt (salt 10) pour tous les mots de passe
- JWT signé 256 bits avec expiration 7 jours
- SecureStore iOS pour stockage sécurisé du token et des données utilisateur
- Variables sensibles dans .env local + Render Environment (non committées)

### Accessibilité
- Props WCAG 2.1 sur Button, Input, EmojiCard, TrackerEau
- Ratio de contraste #15804C / blanc : 5.1:1 (conforme AA)
- Zones tactiles minimum 44x44px sur tous les éléments interactifs

---

## [0.9.0] — Juillet 2026

### Nouvelles fonctionnalités
- Architecture monorepo avec npm workspaces
- Backend Express + Prisma + PostgreSQL
- Authentification JWT (register, login, Google OAuth infrastructure)
- Composants réutilisables (Button, Input, commonStyles)
- Tab bar custom avec icônes Figma
- PhraseCard connectée backend /phrases
- 14 tests unitaires Jest (auth, mealLogs, emotionLogs)

### Infrastructure
- Déploiement initial sur Render
- Base de données PostgreSQL Render (migrée vers Supabase en v1.0.0)