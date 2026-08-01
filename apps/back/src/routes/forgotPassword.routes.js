const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { prisma } = require('../db.js');

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4,
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.json({ message: 'Si cet email existe, un code a été envoyé.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    const code = token.substring(0, 6).toUpperCase();

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    await transporter.sendMail({
      from: `"Healis 🌱" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Réinitialisation de ton mot de passe Healis',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #15804C;">Healis 🌱</h2>
          <p>Bonjour,</p>
          <p>Tu as demandé à réinitialiser ton mot de passe.</p>
          <p>Ton code de réinitialisation est :</p>
          <div style="background: #E8F5EC; padding: 16px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; color: #15804C; letter-spacing: 4px;">
            ${code}
          </div>
          <p>Ce code est valable pendant <strong>1 heure</strong>.</p>
          <p>Si tu n'as pas demandé cette réinitialisation, ignore cet email.</p>
          <p style="color: #888; font-size: 12px;">L'équipe Healis</p>
        </div>
      `,
    });

    res.json({ message: 'Si cet email existe, un code a été envoyé.' });
  } catch (error) {
    console.error('Erreur forgot-password:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return res.status(400).json({ message: 'Code invalide ou expiré' });
    }

    const expectedCode = user.resetToken.substring(0, 6).toUpperCase();
    if (code.toUpperCase() !== expectedCode) {
      return res.status(400).json({ message: 'Code invalide' });
    }

    if (new Date() > user.resetTokenExpiry) {
      return res.status(400).json({ message: 'Code expiré' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;