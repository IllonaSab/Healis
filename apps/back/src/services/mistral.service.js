// On importe le module officiel de Mistral pour pouvoir discuter avec leur intelligence artificielle
const { Mistral } = require('@mistralai/mistralai');

// On initialise le client avec notre clé secrète stockée dans les variables d'environnement
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// Fonction asynchrone qui sert de test rapide pour vérifier que la connexion à l'IA fonctionne bien
async function testMistral() {
  // On envoie un message simple à l'IA et on attend ('await') sa réponse
  const response = await client.chat.complete({
    model: 'mistral-small-latest', // Le modèle d'IA utilisé
    messages: [{ role: 'user', content: 'Dis juste bonjour' }], // La consigne envoyée par l'utilisateur
  });
  // On affiche directement le texte de la réponse reçue dans la console du terminal
  console.log(response.choices[0].message.content);
}

// On exporte la fonction pour pouvoir la lancer depuis un autre fichier si besoin
module.exports = {
  testMistral,
};