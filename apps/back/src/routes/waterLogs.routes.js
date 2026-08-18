const express = require('express');
const { prisma } = require('../db.js');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.query;

    // Si aucune date n'est précisée dans l'URL, on prend la date du jour
    const dateStr = date || new Date().toISOString().split('T')[0];
    // On délimite le début (00h00) et la fin (23h59) de la journée
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    // On récupère tous les verres d'eau enregistrés sur cette journée, du plus ancien au plus récent
    const logs = await prisma.waterLog.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { date: 'asc' },
    });

    // .reduce() parcourt tous les logs et additionne les quantités pour calculer le total bu dans la journée (en partant de 0)
    const total = logs.reduce((sum, log) => sum + log.amount, 0);
    // On renvoie la liste détaillée ainsi que le cumul
    res.json({ logs, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;

    // Sécurité : on vérifie que la quantité est bien envoyée et qu'elle n'est pas négative
    if (amount === undefined || amount < 0) {
      return res.status(400).json({ message: 'amount est requis et doit être positif' });
    }

    // On enregistre la nouvelle quantité d'eau pour l'utilisateur
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
    // Suppression de l'entrée sélectionnée par son identifiant unique
    await prisma.waterLog.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;