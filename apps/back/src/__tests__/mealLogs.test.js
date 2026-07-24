import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRouter from '../routes/auth.routes.js';
import mealLogsRouter from '../routes/mealLogs.routes.js';  // Router des routes protégées : création, récupération, mise à jour des repas
import { authMiddleware } from '../middlewares/auth.middleware.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);
app.use('/meal-logs', authMiddleware, mealLogsRouter);
// Monte les routes protégées /meal-logs
// Toute requête vers /meal-logs DOIT passer par authMiddleware
// Si token absent → 401
// Si token invalide → 401

const testEmail = `mealtest_${Date.now()}@healis.fr`;  // email unique pour éviter les collisions entre tests
let authToken = '';  // Stocke le token JWT 
let createdMealId = '';  // Stocke l'ID du repas créé pour le test de mise à jour

beforeAll(async () => {
  const res = await request(app)
    .post('/auth/register')  // Appelle l'endpoint d'inscription
    .send({ email: testEmail, password: 'Test1234!', firstName: 'Test' });
  authToken = res.body.token;   //token JWT récupérer
});

describe('MealLogs — /meal-logs', () => {  // Tests concernant les routes protégées /meal-logs
  it('devrait créer un repas', async () => {  // créer un repas avec un token valide
    const res = await request(app)
      .post('/meal-logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ mealType: 'PETIT_DEJEUNER', title: 'Porridge test' });  // Body valide : mealType + title

    expect(res.status).toBe(201);  // Le repas doit être créé --> statut 201
    expect(res.body.title).toBe('Porridge test');  // Vérifie que le repas enregistré a bien le bon titre
    createdMealId = res.body.id;  // stocke l'ID du repas pour le test de mise à jour
  });

  it('devrait récupérer les repas du jour', async () => {   // récupérer les repas du jour avec un token valide
    const res = await request(app)
      .get('/meal-logs')
      .set('Authorization', `Bearer ${authToken}`);  // Token envoyé --> authMiddleware laisse passer

    expect(res.status).toBe(200);  // La récupération réussie
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('devrait mettre à jour un repas', async () => {  // mise à jour d'un repas existant
    const res = await request(app)
      .patch(`/meal-logs/${createdMealId}`)  // Route protégée + ID du repas
      .set('Authorization', `Bearer ${authToken}`) //Middelware laisse passer le token
      .send({ eaten: true }); // Body valide : eaten = true

    expect(res.status).toBe(200); // La mise à jour réussie
    expect(res.body.eaten).toBe(true);
  });

  it('devrait refuser sans token', async () => {  // Si une route protégée est appelée SANS token
    const res = await request(app)
      .get('/meal-logs'); // Aucun header Authorization --> authMiddleware bloque 

    expect(res.status).toBe(401); // Le middleware renvoie 401 (non autorisé)
  });
});
