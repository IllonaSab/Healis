import express from 'express';
import { prisma } from '../db.js';

const router = express.Router();

// GET /meal-logs?date=2026-06-30
// Récupère les repas du jour pour l'utilisateur connecté
router.get('/', async (req, res) => {
  try {
    const userId = req.userId; // injecté par le middleware d'auth (à brancher)
    const { date } = req.query;

    const dateStr = date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const mealLogs = await prisma.mealLog.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { date: 'asc' },
    });

    res.json(mealLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /meal-logs
// Crée un repas (suggéré via recipeId OU saisi librement par l'utilisateur)
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { mealType, title, description, recipeId, date } = req.body;

    if (!mealType || !title) {
      return res.status(400).json({ message: 'mealType et title sont requis' });
    }

    const mealLog = await prisma.mealLog.create({
      data: {
        userId,
        mealType,
        title,
        description,
        recipeId: recipeId || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json(mealLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /meal-logs/:id
// Met à jour un repas (titre/description modifiés par l'utilisateur, ou marqué comme mangé)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, eaten } = req.body;

    const mealLog = await prisma.mealLog.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(eaten !== undefined && { eaten }),
      },
    });

    res.json(mealLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /meal-logs/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.mealLog.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
