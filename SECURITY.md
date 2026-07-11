# Sécurité — Healis

## Mesures de sécurité OWASP Top 10

### A01 — Contrôle d'accès défaillant
- Toutes les routes sensibles sont protégées par le middleware `authMiddleware`
- Vérification du JWT à chaque requête
- Données isolées par `userId` — un utilisateur ne peut accéder qu'à ses propres données

### A02 — Défaillances cryptographiques
- Mots de passe hashés avec `bcrypt` (salt rounds : 10)
- JWT signé avec un secret fort (256 bits générés via `crypto.randomBytes`)
- Token stocké côté mobile dans `expo-secure-store` (keychain iOS)

### A03 — Injection
- Prisma ORM utilisé pour toutes les requêtes — pas de SQL brut
- Requêtes paramétrées automatiquement par Prisma

### A05 — Mauvaise configuration de sécurité
- Variables sensibles dans `.env` (non commité — présent dans `.gitignore`)
- CORS configuré sur le backend Express
- En-têtes HTTP sécurisés via Express

### A06 — Composants vulnérables
- Dépendances auditées via `npm audit`
- Mises à jour régulières des packages

### A07 — Échecs d'identification et d'authentification
- JWT avec expiration 7 jours
- Pas de stockage du mot de passe en clair
- Validation des champs email/password avant traitement

### A09 — Échecs de journalisation
- Logs d'erreurs sur les routes backend
- Amélioration prévue : logging centralisé en production

---

## Accessibilité

### Référentiel choisi : WCAG 2.1 (appliqué à React Native)

### Mesures appliquées dans les composants

- **`Button.jsx`** — `accessible={true}`, `accessibilityLabel`, `accessibilityRole="button"`, `accessibilityState={{ disabled }}`
- **`Input.jsx`** — `accessible={true}`, `accessibilityLabel`, `accessibilityRole="search"`
- **Contrastes** — couleur principale `#15804C` sur fond blanc : ratio > 4.5:1 (conforme WCAG AA)
- **Tailles de police** — minimum 12px, textes principaux 14-18px
- **Zones tactiles** — minimum 44x44px sur tous les boutons (recommandation Apple HIG)

### Limitations identifiées
- Lecteur d'écran non testé (VoiceOver iOS)
- Navigation au clavier non applicable (app mobile)
