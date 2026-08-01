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


const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

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
app.use('/chat', authMiddleware, chatRouter);
app.use('/meal-logs', authMiddleware, mealLogsRouter);
app.use('/emotion-logs', authMiddleware, emotionLogsRouter);
app.use('/tracker-logs', authMiddleware, waterLogsRouter);
app.use('/phrases', phrasesRouter);


const PORT = process.env.PORT || 3000;

// Ne lance le serveur que si le fichier est exécuté directement
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
  });
}

module.exports = app;