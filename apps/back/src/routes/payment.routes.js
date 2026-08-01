const express = require('express');
const Stripe = require('stripe');
const { prisma } = require('../db.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /payment/create-checkout
router.post('/create-checkout', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      success_url: 'https://healis-qwss.onrender.com/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://healis-qwss.onrender.com/payment/cancel',
      metadata: { userId: user.id },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erreur Stripe:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// GET /payment/success
router.get('/success', async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const userId = session.metadata.userId;
      await prisma.user.update({
        where: { id: userId },
        data: { plan: 'PREMIUM' },
      });
    }

    res.send(`
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paiement réussi - Healis </title>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 60px 20px; background: #F5F5F5;">
          <div style="background: white; border-radius: 16px; padding: 40px; max-width: 400px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h2 style="color: #15804C; font-size: 24px;">🌱 Paiement réussi !</h2>
            <p style="color: #555; font-size: 16px;">Ton plan Premium est activé.</p>
            <p style="color: #888; font-size: 14px;">Retourne sur l'app Healis pour profiter de toutes les fonctionnalités.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Erreur lors de la validation du paiement');
  }
});

// GET /payment/cancel
router.get('/cancel', (req, res) => {
  res.send(`
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Paiement annulé - Healis</title>
      </head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 60px 20px; background: #F5F5F5;">
        <div style="background: white; border-radius: 16px; padding: 40px; max-width: 400px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h2 style="color: #555; font-size: 24px;">Paiement annulé</h2>
          <p style="color: #888; font-size: 14px;">Tu peux réessayer depuis l'app Healis.</p>
        </div>
      </body>
    </html>
  `);
});

module.exports = router;