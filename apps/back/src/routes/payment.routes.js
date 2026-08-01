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

    res.json({ message: 'Paiement réussi, plan mis à jour en PREMIUM' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /payment/cancel
router.get('/cancel', (req, res) => {
  res.json({ message: 'Paiement annulé' });
});

module.exports = router;