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
    // On génère une liste contenant les dates des 7 derniers jours (d'aujourd'hui jusqu'à il y a 6 jours) au format "AAAA-MM-JJ"
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    });

    // Promise.all lance toutes les vérifications en même temps pour gagner du temps
    const counts = await Promise.all(days.map(async (date) => {
      // On compte le nombre d'entrées créées pour chaque type de log sur la journée
      const [emotions, meals, water] = await Promise.all([
        prisma.emotionLog.count({ where: { userId: req.userId, date: { gte: new Date(date + 'T00:00:00Z'), lte: new Date(date + 'T23:59:59Z') } } }),
        prisma.mealLog.count({ where: { userId: req.userId, date: { gte: new Date(date + 'T00:00:00Z'), lte: new Date(date + 'T23:59:59Z') } } }),
        prisma.waterLog.count({ where: { userId: req.userId, date: { gte: new Date(date + 'T00:00:00Z'), lte: new Date(date + 'T23:59:59Z') } } }),
      ]);
      // Renvoie true si l'utilisateur a rempli au moins une chose ce jour-là, sinon false
      return emotions + meals + water > 0;
    }));

    // Si les 7 jours sont à true, la série vaut 7. Sinon, on s'arrête au premier jour manqué (premier false trouvé)
    const streak = counts.every(Boolean) ? 7 : counts.findIndex(c => !c);
    res.json({ streak });
  } catch (error) {
    logError('GET /stats/streak', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;