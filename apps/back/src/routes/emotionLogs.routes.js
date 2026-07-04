import express from 'express';
import { prisma } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.query;

    const dateStr = date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const logs = await prisma.emotionLog.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { date: 'desc' },
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { emotion, intensity, sensations, note, date } = req.body;

    if (!emotion) {
      return res.status(400).json({ message: 'emotion est requis' });
    }

    const log = await prisma.emotionLog.create({
      data: {
        userId,
        emotion,
        intensity: intensity ?? 5,
        sensations: sensations ?? [],
        note: note ?? null,
        date: date ? new Date(`${date}T12:00:00.000Z`) : new Date(),
      },
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.emotionLog.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
