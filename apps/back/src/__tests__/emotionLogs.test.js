import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRouter from '../routes/auth.routes.js';
import emotionLogsRouter from '../routes/emotionLogs.routes.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);  // routes publiques /auth
app.use('/emotion-logs', authMiddleware, emotionLogsRouter);
// requête vers /emotion-logs --> authMiddleware
// Si token absent → 401 , Si token invalide → 401

const testEmail = `emotiontest_${Date.now()}@healis.fr`;  // Génère un email unique
let authToken = '';  // Stocke le token JWT --> l'inscription

beforeAll(async () => {   // Avant tous les tests --> on crée un utilisateur pour obtenir un token valide
  const res = await request(app)
    .post('/auth/register')
    .send({ email: testEmail, password: 'Test1234!', firstName: 'Test' });
  authToken = res.body.token;  // On récupère le token JWT
});

describe('EmotionLogs — /emotion-logs', () => {  //tests --> routes protégées /emotion-logs
  it('devrait créer un log d\'émotion', async () => {  // Si un log d'émotion à un token valide
    const res = await request(app)
      .post('/emotion-logs')  // Route protégée
      .set('Authorization', `Bearer ${authToken}`)  // Envoie le token dans le header Authorization --> authMiddleware va le vérifier
      .send({ emotion: 'excellent', intensity: 5 });  // Body valide : emotion + intensity

    expect(res.status).toBe(201);  // Le log doit être créé
    expect(res.body.emotion).toBe('excellent');  // Vérifie que l'émotion enregistrée est bien
  });

  it('devrait récupérer les émotions du jour', async () => {  // Si les logs du jour à un token valide
    const res = await request(app)
      .get('/emotion-logs')  // Route protégée
      .set('Authorization', `Bearer ${authToken}`);   // Token envoyé → authMiddleware laisse passer

    expect(res.status).toBe(200);  // Récupération réussie 
    expect(Array.isArray(res.body)).toBe(true);  // Le résultat doit être un tableau
  });

  it('devrait refuser sans émotion', async () => {  // Si manque "emotion"
    const res = await request(app)
      .post('/emotion-logs')   // Token OK → middleware laisse passer
      .set('Authorization', `Bearer ${authToken}`)
      .send({ intensity: 5 });  // Body incomplet 

    expect(res.status).toBe(400);  // Le serveur renvoie une erreur 400
  });

  it('devrait refuser sans token', async () => {   // Si une route protégée est appelée SANS token
    const res = await request(app)
      .get('/emotion-logs');   // Aucun header Authorization → authMiddleware bloque

    expect(res.status).toBe(401);  // Le middleware renvoie 401 (non autorisé)
  });
});
