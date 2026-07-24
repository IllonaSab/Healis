const router = express.Router();
// Router pour les routes /water-logs


router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    // Identifie l’utilisateur via le middleware JWT

    const { date } = req.query;
    // Permet de filtrer par date spécifique

    const dateStr = date || new Date().toISOString().split('T')[0];
    // Si aucune date fournie → utilise la date du jour

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
    // Délimite la journée complète pour la recherche

    const logs = await prisma.waterLog.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { date: 'asc' },
    });
    // Récupère tous les logs d’eau du jour pour cet utilisateur

    const total = logs.reduce((sum, log) => sum + log.amount, 0);
    // Calcule la quantité totale d’eau bue dans la journée

    res.json({ logs, total });
    // Retourne les logs + le total
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    // Identifie l’utilisateur connecté

    const { amount } = req.body;
    // Quantité d’eau ajoutée

    if (amount === undefined || amount < 0) {
      return res.status(400).json({ message: 'amount est requis et doit être positif' });
      // Validation minimale → amount obligatoire et positif
    }

    const log = await prisma.waterLog.create({
      data: { userId, amount },
    });
    // Création du log d’eau

    res.status(201).json(log);
    // Retourne le log créé
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    await prisma.waterLog.delete({ where: { id: req.params.id } });
    // Supprime le log d’eau correspondant à l’ID

    res.status(204).send();
    // 204 → succès sans contenu
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
