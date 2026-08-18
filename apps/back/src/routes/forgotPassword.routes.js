const express = require('express');
// Le module natif 'crypto' permet de créer des chaînes de caractères aléatoires et hautement sécurisées
const crypto = require('crypto');
const bcrypt = require('bcrypt');
// 'Resend' est le service tiers qui se charge d'expédier les emails
const { Resend } = require('resend');
const { prisma } = require('../db.js');

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

function logError(route, error, userId = 'anonymous') {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'ERROR',
    route,
    userId,
    message: error.message,
  }));
}

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Sécurité : même si l'email n'existe pas, on renvoie le même message pour empêcher un pirate de deviner quels comptes existent
    if (!user) {
      return res.json({ message: 'Si cet email existe, un code a été envoyé.' });
    }

    // On génère 32 octets aléatoires convertis en texte hexadécimal
    const token = crypto.randomBytes(32).toString('hex');
    // On définit une durée de validité de 1 heure (60 min * 60 s * 1000 ms) à partir de maintenant
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    // On extrait les 6 premiers caractères du token en majuscules pour faire un code facile à taper pour l'utilisateur
    const code = token.substring(0, 6).toUpperCase();

    // On enregistre le token et sa date limite d'utilisation directement sur le profil de l'utilisateur
    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    // Envoi de l'email au format HTML contenant le code à 6 caractères
    await resend.emails.send({
      from: 'Healis <onboarding@resend.dev>',
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
    logError('POST /auth/forgot-password', error);
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

    // On vérifie que l'utilisateur a bien fait une demande de réinitialisation préalable
    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return res.status(400).json({ message: 'Code invalide ou expiré' });
    }

    // On compare le code saisi par l'utilisateur avec les 6 premiers caractères du token stocké
    const expectedCode = user.resetToken.substring(0, 6).toUpperCase();
    if (code.toUpperCase() !== expectedCode) {
      return res.status(400).json({ message: 'Code invalide' });
    }

    // On s'assure que l'heure actuelle ne dépasse pas la date d'expiration
    if (new Date() > user.resetTokenExpiry) {
      return res.status(400).json({ message: 'Code expiré' });
    }

    // On hache le nouveau mot de passe avec bcrypt avant de le stocker
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // On remplace le mot de passe et on remet le token à 'null' pour qu'il ne puisse plus jamais être réutilisé
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    logError('POST /auth/reset-password', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;