import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { prisma } from './db.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import authRouter from './routes/auth.routes.js';
import mealLogsRouter from './routes/mealLogs.routes.js';

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
app.use('/meal-logs', authMiddleware, mealLogsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});