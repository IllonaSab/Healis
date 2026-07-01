import express from 'express';
import { prisma } from '../db.js';

const router = express.Router();

// GET /emotion-logs?date=2026-06-30
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(new Date(targetDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(targetDate).setHours(23, 59, 59, 999));

    const logs = await prisma.emotionLog.findMany({
      where: {
        userId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /emotion-logs
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { emotion, intensity, sensations, note } = req.body;

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
      },
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /emotion-logs/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.emotionLog.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
