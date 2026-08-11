const express = require('express');
const { prisma } = require('../db.js');

const router = express.Router();

function logError(route, error) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'ERROR',
    route,
    message: error.message,
  }));
}

// GET /phrases?day=1
router.get('/', async (req, res) => {
  try {
    const day = parseInt(req.query.day ?? new Date().getDay());

    let phrase = await prisma.phrase.findFirst({ where: { day } });

    if (!phrase) {
      const FALLBACK = [
        "Tu fais du mieux que tu peux, et c'est suffisant.",
        "Chaque journée est une nouvelle chance de prendre soin de toi.",
        "Tu n'es pas seul(e) dans ce chemin.",
        "La guérison n'est pas linéaire, et c'est normal.",
        "Tu mérites la douceur, surtout de toi-même.",
        "Un petit pas aujourd'hui, c'est déjà une victoire.",
        "Ton corps fait de son mieux pour toi, chaque jour.",
      ];
      return res.json({ content: FALLBACK[day] });
    }

    res.json(phrase);
  } catch (error) {
    logError('GET /phrases', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;