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

// GET /stats/streak
router.get('/streak', async (req, res) => {
  try {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    });

    const counts = await Promise.all(days.map(async (date) => {
      const [emotions, meals, water] = await Promise.all([
        prisma.emotionLog.count({ where: { userId: req.userId, date: { gte: new Date(date + 'T00:00:00Z'), lte: new Date(date + 'T23:59:59Z') } } }),
        prisma.mealLog.count({ where: { userId: req.userId, date: { gte: new Date(date + 'T00:00:00Z'), lte: new Date(date + 'T23:59:59Z') } } }),
        prisma.waterLog.count({ where: { userId: req.userId, date: { gte: new Date(date + 'T00:00:00Z'), lte: new Date(date + 'T23:59:59Z') } } }),
      ]);
      return emotions + meals + water > 0;
    }));

    const streak = counts.every(Boolean) ? 7 : counts.findIndex(c => !c);
    res.json({ streak });
  } catch (error) {
    logError('GET /stats/streak', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;