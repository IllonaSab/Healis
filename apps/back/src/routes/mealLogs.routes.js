const router = express.Router();
// Router pour toutes les routes /meal-logs


// GET /meal-logs?date=YYYY-MM-DD
// Récupère les repas du jour pour l'utilisateur connecté
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    // Injecté par le middleware JWT → identifie l’utilisateur

    const { date } = req.query;
    // Permet de filtrer les repas d’une date spécifique

    const dateStr = date || new Date().toISOString().split('T')[0];
    // Si aucune date fournie → utilise la date du jour

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
    // Délimite la journée complète pour la recherche

    const mealLogs = await prisma.mealLog.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { date: 'asc' },
    });
    // Récupère tous les repas du jour pour cet utilisateur

    res.json(mealLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// POST /meal-logs
// Crée un repas (manuel ou basé sur une recette)
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    // Identifie l’utilisateur connecté

    const { mealType, title, description, recipeId, date } = req.body;
    // Données du repas envoyées par le client

    if (!mealType || !title) {
      return res.status(400).json({ message: 'mealType et title sont requis' });
      // Validation minimale → type + titre obligatoires
    }

    const mealLog = await prisma.mealLog.create({
      data: {
        userId,
        mealType,
        title,
        description,
        recipeId: recipeId || null,   // Optionnel
        date: date ? new Date(date) : new Date(), // Date fournie ou date actuelle
      },
    });

    res.status(201).json(mealLog);
    // Retourne le repas créé
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// PATCH /meal-logs/:id
// Met à jour un repas (titre, description, ou statut "mangé")
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, eaten } = req.body;
    // Champs modifiables

    const mealLog = await prisma.mealLog.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(eaten !== undefined && { eaten }),
      },
    });
    // Mise à jour partielle → uniquement les champs envoyés

    res.json(mealLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// DELETE /meal-logs/:id
// Supprime un repas
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.mealLog.delete({ where: { id } });
    // Suppression du repas

    res.status(204).send();
    // 204 → succès sans contenu
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
