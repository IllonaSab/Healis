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

router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    // req.query récupère les paramètres après le '?' dans l'URL (ex: /emotion-logs?date=2026-08-18)
    const { date } = req.query;

    // Si aucune date n'est fournie, on prend automatiquement celle d'aujourd'hui (format AAAA-MM-JJ)
    const dateStr = date || new Date().toISOString().split('T')[0];
    // On crée la borne de début (00h 00m 00s) et la borne de fin (23h 59m 59s) pour cibler la journée entière
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    // 'gte' = plus grand ou égal (Greater Than or Equal), 'lte' = plus petit ou égal (Less Than or Equal)
    // On cherche les logs créés entre le début et la fin de la journée ciblée
    const logs = await prisma.emotionLog.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
      orderBy: { date: 'desc' }, // Trie du plus récent au plus ancien
    });

    res.json(logs);
  } catch (error) {
    logError('GET /emotion-logs', error, req.userId);
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
        // L'opérateur '??' donne une valeur par défaut uniquement si la variable vaut null ou undefined
        intensity: intensity ?? 5,
        sensations: sensations ?? [],
        note: note ?? null,
        // Si une date spécifique est envoyée on l'utilise, sinon on prend l'heure exacte du moment
        date: date ? new Date(`${date}T12:00:00.000Z`) : new Date(),
      },
    });

    res.status(201).json(log);
  } catch (error) {
    logError('POST /emotion-logs', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // req.params.id récupère l'identifiant unique passé directement dans l'URL pour supprimer la ligne correspondante
    await prisma.emotionLog.delete({ where: { id: req.params.id } });
    // 204 indique que la suppression a réussi et qu'il n'y a rien de plus à renvoyer
    res.status(204).send();
  } catch (error) {
    logError('DELETE /emotion-logs/:id', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;