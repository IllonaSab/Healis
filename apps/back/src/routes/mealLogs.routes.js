const express = require('express');
const { prisma } = require('../db.js');

const router = express.Router();

function logError(route, error, userId = 'anonymous') {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'ERROR',
    route,
    userId,
    message: error.message,
  }));
}

// GET /meal-logs?date=2026-06-30
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.query;

    const dateStr = date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const mealLogs = await prisma.mealLog.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
      orderBy: { date: 'asc' },
    });

    res.json(mealLogs);
  } catch (error) {
    logError('GET /meal-logs', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

// POST /meal-logs
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
    logError('POST /meal-logs', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

// PATCH /meal-logs/:id
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
    logError('PATCH /meal-logs/:id', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

// DELETE /meal-logs/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.mealLog.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    logError('DELETE /meal-logs/:id', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;