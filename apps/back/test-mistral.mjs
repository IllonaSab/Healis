import 'dotenv/config';
import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  console.error('❌ MISTRAL_API_KEY manquante dans le .env');
  process.exit(1);
}

const client = new Mistral({ apiKey });

async function testMistral() {
  try {
    console.log('Connexion à Mistral...');
    const response = await client.chat.complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: 'Dis juste bonjour en une phrase courte.' }],
    });

    console.log('✅ Réponse reçue :');
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('❌ Erreur lors de l\'appel à Mistral :');
    console.error(error.message || error);
  }
}

testMistral();
