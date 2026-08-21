require('dotenv/config');
const express = require('express');
const cors = require('cors');

const { prisma } = require('./db.js');
const { authMiddleware } = require('./middlewares/auth.middleware.js');

const authRouter = require('./routes/auth.routes.js');
const chatRouter = require('./routes/chat.routes.js');
const emotionLogsRouter = require('./routes/emotionLogs.routes.js');
const mealLogsRouter = require('./routes/mealLogs.routes.js');
const waterLogsRouter = require('./routes/waterLogs.routes.js');
const phrasesRouter = require('./routes/phrases.routes.js');
const forgotPasswordRouter = require('./routes/forgotPassword.routes.js');
const paymentRouter = require('./routes/payment.routes.js');
const statsRouter = require('./routes/stats.routes.js');

const app = express();
app.use(cors());
app.use(express.json());

// S'exécute à chaque requête : mesure le temps de réponse et affiche un journal JSON dès que la réponse est envoyée 
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    }));
  });
  next(); // Donne la main au middleware ou à la route suivante
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => res.json({ service: 'Healis API', status: 'ok' }));

// Route de diagnostic : vérifie que le serveur arrive bien à joindre la base de données en effectuant une requête simple 
app.get('/health/db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ status: 'ok', userCount });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.use('/auth', authRouter);
app.use('/auth', forgotPasswordRouter);
// En insérant 'authMiddleware', seules les requêtes avec un token valide accèdent aux routes suivantes
app.use('/chat', authMiddleware, chatRouter);
app.use('/meal-logs', authMiddleware, mealLogsRouter);
app.use('/emotion-logs', authMiddleware, emotionLogsRouter);
app.use('/tracker-logs', authMiddleware, waterLogsRouter);
app.use('/phrases', phrasesRouter);
app.use('/payment', paymentRouter);
app.use('/stats', authMiddleware, statsRouter);

const PORT = process.env.PORT || 3000;

// Empêche le serveur d'occuper un port réseau réel lors de l'exécution des tests automatisés
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
  });
}

module.exports = app;