const express = require('express');
// SDK officiel de Stripe pour gérer les paiements et abonnements sécurisés
const Stripe = require('stripe');
const { prisma } = require('../db.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');

const router = express.Router();
// Initialisation du client Stripe avec la clé secrète du compte
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function logError(route, error, userId = 'anonymous') {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'ERROR',
    route,
    userId,
    message: error.message,
  }));
}

// POST /payment/create-checkout
router.post('/create-checkout', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    // On génère une page de paiement hébergée et sécurisée directement par Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Moyens de paiement acceptés (carte bancaire)
      mode: 'subscription', // Mode abonnement récurrent (prélèvement automatique régulier)
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }], // Identifiant du tarif défini dans le tableau de bord Stripe
      customer_email: user.email, // Pré-remplit automatiquement l'adresse email de l'utilisateur sur la page de paiement
      // URLs vers lesquelles Stripe redirigera l'utilisateur après l'opération
      // {CHECKOUT_SESSION_ID} est remplacé dynamiquement par Stripe avec l'identifiant unique de la transaction
      success_url: 'https://healis-qwss.onrender.com/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://healis-qwss.onrender.com/payment/cancel',
      // 'metadata' permet d'attacher nos propres données (ici l'ID utilisateur) à la session Stripe pour la retrouver plus tard
      metadata: { userId: user.id },
    });

    // On renvoie l'URL Stripe Checkout à l'application cliente pour qu'elle redirige l'utilisateur
    res.json({ url: session.url });
  } catch (error) {
    logError('POST /payment/create-checkout', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

// GET /payment/success
router.get('/success', async (req, res) => {
  try {
    // On extrait l'identifiant de la session Stripe passé dans l'URL de redirection (?session_id=...)
    const { session_id } = req.query;
    // On interroge Stripe pour vérifier l'état réel de cette session de paiement
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Sécurité : on vérifie que le paiement a bien été validé et encaissé
    if (session.payment_status === 'paid') {
      // On récupère l'identifiant de notre utilisateur stocké plus tôt dans les métadonnées
      const userId = session.metadata.userId;
      // On passe le statut de l'utilisateur à 'PREMIUM' en base de données
      await prisma.user.update({ where: { id: userId }, data: { plan: 'PREMIUM' } });
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        type: 'PAYMENT_SUCCESS',
        userId,
        plan: 'PREMIUM',
      }));
    }

    // On affiche une page HTML simple pour confirmer le succès à l'utilisateur
    res.send(`
      <html>
        <head><meta charset="UTF-8"><title>Paiement réussi - Healis</title></head>
        <body style="font-family: Arial; text-align: center; padding: 60px 20px; background: #F5F5F5;">
          <div style="background: white; border-radius: 16px; padding: 40px; max-width: 400px; margin: 0 auto;">
            <h2 style="color: #15804C;">🌱 Paiement réussi !</h2>
            <p style="color: #555;">Ton plan Premium est activé.</p>
            <p style="color: #888; font-size: 14px;">Ferme cette fenêtre et retourne sur l'app Healis.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    logError('GET /payment/success', error);
    res.status(500).send('Erreur lors de la validation du paiement');
  }
});

// GET /payment/cancel
router.get('/cancel', (req, res) => {
  // Page affichée si l'utilisateur annule ou quitte la page de paiement avant d'avoir payé
  res.send(`
    <html>
      <head><meta charset="UTF-8"><title>Paiement annulé - Healis</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 60px 20px; background: #F5F5F5;">
        <div style="background: white; border-radius: 16px; padding: 40px; max-width: 400px; margin: 0 auto;">
          <h2 style="color: #555;">Paiement annulé</h2>
          <p style="color: #888; font-size: 14px;">Tu peux réessayer depuis l'app Healis.</p>
        </div>
      </body>
    </html>
  `);
});

module.exports = router;