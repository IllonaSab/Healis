const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../db.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');

const router = express.Router();

function logError(route, error, userId = 'anonymous') {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'ERROR',
    route,
    userId,
    message: error.message,
  }));
}

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    // Déstructuration : on extrait les champs envoyés dans le corps JSON de la requête
    const { email, password, firstName, objectif } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Prisma interroge la base de données SQL pour chercher si un compte possède déjà cet email unique
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cet email' });
    }

    // Sécurité : on ne stocke jamais un mot de passe en clair.
    // 'bcrypt.hash' le transforme en une empreinte indéchiffrable. Le '10' correspond au coût de calcul.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertion d'une nouvelle ligne dans la table 'user' avec le mot de passe sécurisé
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, objectif },
    });

    // Génération du JWT contenant l'ID de l'utilisateur, clé secrète et valide 7 jours
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // On renvoie le token et les infos utiles, en excluant volontairement le mot de passe de la réponse
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        plan: user.plan,
        objectif: user.objectif,
      },
    });
  } catch (error) {
    // Si une exception non prévue survient (ex: perte de connexion DB), on logue l'erreur et on renvoie une 500
    logError('POST /auth/register', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Message volontairement générique pour ne pas indiquer si c'est l'email ou le mot de passe qui est faux
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // 'bcrypt.compare' compare le mot de passe reçu avec l'empreinte chiffrée en base sans jamais déchiffrer cette dernière
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Le mot de passe est bon : on fabrique et retourne un nouveau badge d'accès (token JWT)
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        plan: user.plan,
        objectif: user.objectif,
      },
    });
  } catch (error) {
    logError('POST /auth/login', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /auth/google
router.post('/google', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: 'accessToken requis' });
    }

    // On interroge l'API de Google en lui passant le jeton reçu pour vérifier l'identité de l'utilisateur
    const googleRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const googleUser = await googleRes.json();

    if (!googleUser.email) {
      return res.status(401).json({ message: 'Token Google invalide' });
    }

    // On regarde si l'utilisateur s'est déjà connecté par le passé avec cette adresse Google
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    // Si c'est sa première connexion Google, on crée automatiquement son profil en base
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          firstName: googleUser.given_name || '',
          password: '', // Pas de mot de passe requis car l'authentification est déléguée à Google
        },
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        plan: user.plan,
        objectif: user.objectif,
      },
    });
  } catch (error) {
    logError('POST /auth/google', error);
    res.status(500).json({ message: error.message });
  }
});

// PATCH /auth/password
// 'authMiddleware' s'exécute en premier : il vérifie le token et injecte l'ID de l'utilisateur connecté dans 'req.userId'
router.patch('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    // On retrouve l'utilisateur directement à partir de l'identifiant extrait du token
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    // Sécurité : on vérifie que l'utilisateur connaît bien son ancien mot de passe avant de lui permettre de le changer
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    // On chiffre le nouveau mot de passe puis on met à jour la ligne en base de données
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    logError('PATCH /auth/password', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

// PATCH /auth/plan
router.patch('/plan', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;

    // Validation stricte : on refuse toute valeur qui ne fait pas partie de notre liste autorisée
    if (!['FREE', 'PREMIUM'].includes(plan)) {
      return res.status(400).json({ message: 'Plan invalide' });
    }

    // Mise à jour du plan d'abonnement pour l'utilisateur connecté
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { plan },
    });

    res.json({ message: 'Plan mis à jour', plan: user.plan });
  } catch (error) {
    logError('PATCH /auth/plan', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

// GET /auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Permet à l'application cliente de récupérer les données du profil connecté à partir de son token
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      plan: user.plan,
      objectif: user.objectif,
    });
  } catch (error) {
    logError('GET /auth/me', error, req.userId);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;