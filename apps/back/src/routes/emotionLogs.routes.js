const router = express.Router();
// Router pour les routes /emotion-logs


router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    // Identifie l'utilisateur via le middleware JWT

    const { date } = req.query;
    // Permet de filtrer par date spécifique

    const dateStr = date || new Date().toISOString().split('T')[0];
    // Si aucune date fournie → utilise la date du jour (YYYY-MM-DD)

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
    // Délimite le début et la fin de la journée pour la recherche

    const logs = await prisma.emotionLog.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { date: 'desc' },
    });
    // Récupère tous les logs de la journée pour cet utilisateur

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    // Identifie l'utilisateur connecté

    const { emotion, intensity, sensations, note, date } = req.body;
    // Données du log envoyées par le client

    if (!emotion) {
      return res.status(400).json({ message: 'emotion est requis' });
      // Validation minimale → émotion obligatoire
    }

    const log = await prisma.emotionLog.create({
      data: {
        userId,
        emotion,
        intensity: intensity ?? 5,        // Valeur par défaut : 5
        sensations: sensations ?? [],     // Tableau vide par défaut
        note: note ?? null,               // Note optionnelle
        date: date ? new Date(`${date}T12:00:00.000Z`) : new Date(),
        // Si date fournie → fixe à midi pour éviter les décalages timezone
        // Sinon → date actuelle
      },
    });

    res.status(201).json(log);
    // Retourne le log créé
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    await prisma.emotionLog.delete({ where: { id: req.params.id } });
    // Supprime le log correspondant à l'ID

    res.status(204).send();
    // 204 → succès sans contenu
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;
