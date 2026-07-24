import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const router = express.Router();
// Router principal pour toutes les routes /auth


// POST /auth/register — création de compte
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName } = req.body;
    // Récupération des données envoyées par le client

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
      // Vérification des champs obligatoires
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    // Vérifie si un utilisateur existe déjà avec cet email

    if (existingUser) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cet email' });
      // Empêche la création d’un compte en doublon
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Hash sécurisé du mot de passe

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName },
    });
    // Création de l’utilisateur dans la base

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    // Génération du token JWT contenant l’ID utilisateur

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, plan: user.plan },
      // Retourne le token + infos utilisateur
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    // Gestion des erreurs serveur
  }
});


// POST /auth/login — connexion utilisateur
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Récupération des credentials

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
      // Vérification des champs obligatoires
    }

    const user = await prisma.user.findUnique({ where: { email } });
    // Recherche de l’utilisateur par email

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      // Email inconnu --> accès refusé
    }

    const isValid = await bcrypt.compare(password, user.password);
    // Vérifie le mot de passe hashé

    if (!isValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      // Mot de passe incorrect
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    // Génère un token JWT valide

    res.json({
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, plan: user.plan },
      // Retourne le token + infos utilisateur
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    // Gestion des erreurs serveur
  }
});

export default router;


// POST /auth/google — connexion via Google OAuth
router.post('/google', async (req, res) => {
  try {
    const { accessToken } = req.body;
    // Token Google envoyé par le client

    if (!accessToken) {
      return res.status(400).json({ message: 'accessToken requis' });
      // Vérification du champ obligatoire
    }

    // Appel API Google pour récupérer les infos utilisateur
    const googleRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const googleUser = await googleRes.json();
    // Données utilisateur Google

    if (!googleUser.email) {
      return res.status(401).json({ message: 'Token Google invalide' });
      // Token Google invalide --> pas d’email
    }

    // Vérifie si l’utilisateur existe déjà
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      // Sinon → création d’un compte Google
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          firstName: googleUser.given_name || '',
          password: '', // Pas de mot de passe pour Google
        },
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    // Génère un token JWT pour l’utilisateur Google

    res.json({
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, plan: user.plan },
      // Retourne le token + infos utilisateur
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    // Gestion des erreurs serveur
  }
});
