const router = express.Router();
// Router pour les routes /phrases


// GET /phrases?day=1
router.get('/', async (req, res) => {
  try {
    const day = parseInt(req.query.day ?? new Date().getDay());
    // Jour demandé ou jour actuel si absent

    let phrase = await prisma.phrase.findFirst({
      where: { day },
    });
    // Recherche d'une phrase en base pour ce jour

    // Fallback si aucune phrase trouvée
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
      // Retourne une phrase par défaut selon le jour
    }

    res.json(phrase);
    // Retourne la phrase trouvée en base
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
