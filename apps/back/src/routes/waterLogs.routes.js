import express from 'express';
import { prisma } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(new Date(targetDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(targetDate).setHours(23, 59, 59, 999));

    const logs = await prisma.waterLog.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { date: 'asc' },
    });

    const total = logs.reduce((sum, log) => sum + log.amount, 0);
    res.json({ logs, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;

    if (amount === undefined || amount < 0) {
      return res.status(400).json({ message: 'amount est requis et doit être positif' });
    }

    const log = await prisma.waterLog.create({
      data: { userId, amount },
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.waterLog.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;