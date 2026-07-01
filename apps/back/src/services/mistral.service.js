// apps/backend/src/services/mistral.service.js
import { Mistral } from '@mistralai/mistralai';

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export async function testMistral() {
  const response = await client.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: 'Dis juste bonjour' }],
  });
  console.log(response.choices[0].message.content);
}