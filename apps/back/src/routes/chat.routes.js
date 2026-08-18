const express = require('express');
const { Mistral } = require('@mistralai/mistralai');
const { prisma } = require('../db.js');

const router = express.Router();
// On initialise la connexion au service de l'IA Mistral avec notre clé secrète
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// Le System Prompt sert de consigne de base pour définir le rôle, le ton et les règles de sécurité de l'IA
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

function logError(route, error, userId = 'anonymous') {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'ERROR',
    route,
    userId,
    message: error.message,
  }));
}

// POST /chat
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    // history = [] donne une valeur par défaut vide si aucun historique n'est envoyé
    const { message, history = [], conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'message est requis' });
    }

    // On rassemble les anciens messages et le tout dernier message pour donner du contexte à l'IA
    const mistralMessages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    // On envoie la demande à l'API Mistral et on attend sa réponse
    const response = await client.chat.complete({
      model: 'mistral-small-latest',
      messages: mistralMessages,
      system: SYSTEM_PROMPT,
      maxTokens: 300, // Limite la longueur maximale de la réponse générée
    });

    // On extrait uniquement le texte de la première réponse fournie par l'IA
    const reply = response.choices[0].message.content;

    // Si la discussion est liée à un fil de conversation, on enregistre d'un coup la question et la réponse en base de données
    if (conversationId) {
      await prisma.message.createMany({
        data: [
          { conversationId, role: 'USER', content: message },
          { conversationId, role: 'ASSISTANT', content: reply },
        ],
      });
    }

    res.json({ reply });
  } catch (error) {
    logError('POST /chat', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

// POST /chat/conversation
router.post('/conversation', async (req, res) => {
  try {
    // Crée une nouvelle conversation vide rattachée à l'utilisateur connecté
    const conversation = await prisma.conversation.create({
      data: { userId: req.userId },
    });
    res.status(201).json(conversation);
  } catch (error) {
    logError('POST /chat/conversation', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

// GET /chat/conversation/:id
router.get('/conversation/:id', async (req, res) => {
  try {
    // Récupère tous les messages d'une conversation triés du plus ancien au plus récent (ordre chronologique)
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (error) {
    logError('GET /chat/conversation/:id', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;