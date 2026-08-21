# Sécurité & Accessibilité — Healis

Healis traite des **données de santé** (art. 9 RGPD). Référentiels : OWASP Top 10 (2021), RGPD, WCAG 2.2 AA. Les écarts ci-dessous sont issus d'un audit du code.

| | En place | À corriger |
|---|---|---|
| **A01** Contrôle d'accès | `authMiddleware`, `userId` issu du JWT, UUID v4, filtrage `where: { userId }` en lecture | Propriété non vérifiée sur 6 routes `:id` — dont `GET /chat/conversation/:id` |
| **A02** Cryptographie | bcrypt 10 rounds, JWT 256 bits, `expo-secure-store`, TLS, Stripe hébergé | `algorithms` non contraint sur `jwt.verify` |
| **A03** Injection | Prisma partout, pages HTML statiques, system prompt serveur non exposé | Historique de chat fourni par le client |
| **A04** Conception | Ni poids ni calories au schéma, prompt éthique strict, orientation vers un professionnel | Premium sans validation médicale |
| **A05** Configuration | Secrets en variables d'env, environnements séparés, `.env.test` corrigé et secrets rotés | `helmet` absent, CORS ouvert, `error.message` renvoyé au client |
| **A06** Dépendances | Versions figées, lockfile versionné, `npm audit`, Dependabot | `nodemailer` résiduel |
| **A07** Authentification | Erreurs non discriminantes, code de reset à usage unique | Aucun rate limiting ; audience du jeton Google non vérifiée |
| **A08** Intégrité | CI bloquante, secrets GitHub, actions épinglées | `npm install` au lieu de `npm ci` |
| **A09** Journalisation | Logs JSON structurés, sondes `/health`, alertes email ; ni `body` ni `headers` journalisés | Rétention limitée, pas d'alerte sur échecs d'auth |
| **A10** SSRF | URL sortantes codées en dur, aucun import par URL | — |

**RGPD** — Hébergement **Paris** (Supabase `eu-west-3`) et **Mistral France** : aucun transfert de données de santé hors UE. Minimisation respectée, cascades `onDelete` en place.
Manquent la **suppression de compte** (art. 17) et le **recueil du consentement** (art. 9) : ce sont les deux correctifs prioritaires.

**Accessibilité** — Contraste `#15804C` à 4,97:1 (AA), `EmojiCard` conforme au critère 1.4.1, rôles et libellés déclarés sur les composants.
Trois écarts : `accessibilityRole="search"` sur les champs texte, `minHeight` absent sur `Button` (29–45 px), streak masqué après 5 s sans prolongation possible.
VoiceOver et TalkBack restent à tester.