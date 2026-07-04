import express from 'express';
import { Mistral } from '@mistralai/mistralai';
import { prisma } from '../db.js';

const router = express.Router();
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

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

// POST /chat
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { message, history = [], conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'message est requis' });
    }

    // Construire l'historique pour Mistral
    const mistralMessages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const response = await client.chat.complete({
      model: 'mistral-small-latest',
      messages: mistralMessages,
      system: SYSTEM_PROMPT,
      maxTokens: 300,
    });

    const reply = response.choices[0].message.content;

    // Sauvegarder la conversation en base si conversationId fourni
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
    console.error('Erreur Mistral:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// POST /chat/conversation — créer une nouvelle conversation
router.post('/conversation', async (req, res) => {
  try {
    const userId = req.userId;
    const conversation = await prisma.conversation.create({
      data: { userId },
    });
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /chat/conversation/:id — charger l'historique
router.get('/conversation/:id', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
