const app = express();
app.use(cors());
app.use(express.json());
// Configuration de base de l’API : CORS + parsing JSON


app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
  // Endpoint simple pour vérifier que le serveur tourne
});


app.get('/health/db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    // Vérifie la connexion DB en comptant les utilisateurs

    res.json({ status: 'ok', userCount });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
    // Si la DB est inaccessible → renvoie une erreur
  }
});


app.use('/auth', authRouter);
// Routes publiques : inscription + login

app.use('/chat', authMiddleware, chatRouter);
// Routes protégées : chat Mistral → nécessite un token

app.use('/meal-logs', authMiddleware, mealLogsRouter);
// Journal alimentaire → protégé par JWT

app.use('/emotion-logs', authMiddleware, emotionLogsRouter);
// Journal des émotions → protégé par JWT

app.use('/tracker-logs', authMiddleware, waterLogsRouter);
// Suivi de l’eau → protégé par JWT

app.use('/phrases', phrasesRouter);
// Phrases du jour → route publique


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
  // Démarre le serveur sur le port défini
});
