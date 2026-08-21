// Charge les variables spécifiques à l'environnement de test (base de données de test, etc.) depuis le fichier .env.test
if (!process.env.CI) require('dotenv').config({ path: '.env.test' });

const { prisma } = require('./db.js');

// S'exécute automatiquement une fois que tous les tests sont terminés
afterAll(async () => {
  // Ferme proprement la connexion à la base de données pour éviter que le processus de test reste bloqué
  await prisma.$disconnect();
});