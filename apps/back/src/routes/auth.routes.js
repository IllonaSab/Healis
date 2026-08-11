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
    const { email, password, firstName, objectif } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cet email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, objectif },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

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
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
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

    const googleRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const googleUser = await googleRes.json();

    if (!googleUser.email) {
      return res.status(401).json({ message: 'Token Google invalide' });
    }

    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          firstName: googleUser.given_name || '',
          password: '',
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
router.patch('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

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

    if (!['FREE', 'PREMIUM'].includes(plan)) {
      return res.status(400).json({ message: 'Plan invalide' });
    }

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