const router = express.Router();
// Router principal pour toutes les routes /chat

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
// Client Mistral pour envoyer les messages au modèle


const SYSTEM_PROMPT = `Tu es le "toi du futur" de l'utilisateur — une version apaisée, bienveillante, qui a trouvé la paix.
Tu parles à la première personne ("je me souviens quand...", "moi aussi j'ai ressenti ça...").
Tu n'es PAS un professionnel de santé et tu ne prétends jamais l'être.
Tu ne donnes JAMAIS de conseils sur la nourriture, les repas, les calories, le poids ou le corps.
Tu ne commentes JAMAIS l'apparence physique, ni positivement ni négativement.
Tu ne proposes JAMAIS de plans alimentaires, recettes ou idées de repas.
Tu te concentres uniquement sur les émotions, les ressentis, le soutien émotionnel.
Si l'utilisateur exprime une souffrance, une détresse ou parle de comportements difficiles,
tu l'encourages avec bienveillance à contacter un professionnel spécialisé :
- En France : Anorexie Boulimie Info Soins au 09 69 325 900 (lun-ven 9h-17h)
- Ou à consulter un médecin ou psychologue spécialisé en TCA
Tu ne remplaces pas ce soutien professionnel.
Tes réponses sont courtes (2-3 phrases), douces, chaleureuses, sans jugement.
Tu valides toujours l'émotion avant toute autre chose.`;
// Prompt système → définit la personnalité et les règles strictes du modèle Mistral


// POST /chat — envoyer un message au modèle
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    // Récupéré via le middleware JWT → identifie l'utilisateur

    const { message, history = [], conversationId } = req.body;
    // message = texte envoyé par l'utilisateur
    // history = historique de conversation
    // conversationId = identifiant pour sauvegarder en base

    if (!message) {
      return res.status(400).json({ message: 'message est requis' });
      // Validation : un message est obligatoire
    }

    // Construction du format attendu par Mistral
    const mistralMessages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    // Appel au modèle Mistral
    const response = await client.chat.complete({
      model: 'mistral-small-latest',
      messages: mistralMessages,
      system: SYSTEM_PROMPT,
      maxTokens: 300,
    });

    const reply = response.choices[0].message.content;
    // Réponse générée par Mistral

    // Sauvegarde en base si conversationId fourni
    if (conversationId) {
      await prisma.message.createMany({
        data: [
          { conversationId, role: 'USER', content: message },
          { conversationId, role: 'ASSISTANT', content: reply },
        ],
      });
    }

    res.json({ reply });
    // Retourne la réponse du modèle
  } catch (error) {
    console.error('Erreur Mistral:', error.message);
    res.status(500).json({ message: error.message });
    // Gestion des erreurs
  }
});


// POST /chat/conversation — créer une nouvelle conversation
router.post('/conversation', async (req, res) => {
  try {
    const userId = req.userId;
    // Identifie l’utilisateur qui crée la conversation

    const conversation = await prisma.conversation.create({
      data: { userId },
    });
    // Création d’une nouvelle conversation liée à l’utilisateur

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET /chat/conversation/:id — récupérer l'historique d'une conversation
router.get('/conversation/:id', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      orderBy: { createdAt: 'asc' },
    });
    // Récupère tous les messages d’une conversation, triés par date

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
