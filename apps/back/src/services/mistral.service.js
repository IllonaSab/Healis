const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
// Initialise le client Mistral avec la clé API


export async function testMistral() {
  const response = await client.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: 'Dis juste bonjour' }],
    // Envoie un message simple au modèle pour vérifier la connexion
  });

  console.log(response.choices[0].message.content);
  // Affiche la réponse du modèle → permet de tester que Mistral fonctionne
}
