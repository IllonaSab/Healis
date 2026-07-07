import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { prisma } from './db.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.routes.js';
import emotionLogsRouter from './routes/emotionLogs.routes.js';
import mealLogsRouter from './routes/mealLogs.routes.js';
import waterLogsRouter from './routes/waterLogs.routes.js';
import phrasesRouter from './routes/phrases.routes.js';

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
app.use('/chat', authMiddleware, chatRouter);
app.use('/meal-logs', authMiddleware, mealLogsRouter);
app.use('/emotion-logs', authMiddleware, emotionLogsRouter);
app.use('/tracker-logs', authMiddleware, waterLogsRouter);
app.use('/phrases', phrasesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});