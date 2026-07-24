const apiKey = process.env.MISTRAL_API_KEY;
// Récupère la clé API depuis l'environnement

if (!apiKey) {
  console.error('❌ MISTRAL_API_KEY manquante dans le .env');
  process.exit(1);
  // Stoppe l'exécution si la clé est absente → évite un crash silencieux
}

const client = new Mistral({ apiKey });
// Initialise le client Mistral avec la clé API


async function testMistral() {
  try {
    console.log('Connexion à Mistral...');
    // Indique le début du test de connexion

    const response = await client.chat.complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: 'Dis juste bonjour en une phrase courte.' }],
      // Envoie un prompt simple pour vérifier que l'API répond
    });

    console.log('✅ Réponse reçue :');
    console.log(response.choices[0].message.content);
    // Affiche la réponse du modèle → validation du bon fonctionnement
  } catch (error) {
    console.error('❌ Erreur lors de l\'appel à Mistral :');
    console.error(error.message || error);
    // Log clair en cas d'erreur API
  }
}

testMistral();
// Lance le test immédiatement au démarrage du script
