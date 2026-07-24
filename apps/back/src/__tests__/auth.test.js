import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRouter from '../routes/auth.routes.js';

const app = express();
app.use(cors());  // Active CORS sur l'application
app.use(express.json());
app.use('/auth', authRouter);  // Monte le router d'authentification sur le chemin /auth

const testEmail = `test_${Date.now()}@healis.fr`;  // Génère un email unique pour éviter les conflits entre tests
const testPassword = 'Test1234!';  // Mot de passe utilisé pour les tests
let authToken = '';  // Stocke le token JWT --> l'inscription

describe('Auth — /auth/register', () => {  // Groupe de tests auth + resgiter
  it('devrait créer un compte avec email/password/firstName', async () => {
    const res = await request(app)
      .post('/auth/register')  // Appelle l'endpoint POST /auth/register
      .send({ email: testEmail, password: testPassword, firstName: 'Test' });  // Envoie le body JSON
      console.log('Response body:', res.body);  // Log de la réponse

    expect(res.status).toBe(201);  // renvoie --> statut 201
    expect(res.body).toHaveProperty('token');  //réponse contient un token JWT
    expect(res.body.user.email).toBe(testEmail);  //email bien retourné
    authToken = res.body.token;  // Stocke le token pour les autres tests
  });

  it('devrait refuser un email déjà utilisé', async () => {  // Si un email est déjà enregistré
    const res = await request(app)
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword, firstName: 'Test' });  //Re-envoie la même requête --> doit échouer

    expect(res.status).toBe(409);  // le serveur renvoie un message (email déjà utilisé)
  });

  it('devrait refuser si email manquant', async () => {  // Si un email est bien renseigné
    const res = await request(app)
      .post('/auth/register')
      .send({ password: testPassword });

    expect(res.status).toBe(400);  //le serveur renvoie une erreur 400
  });
});

describe('Auth — /auth/login', () => {
  it('devrait connecter un utilisateur existant', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });  // Envoie email + password corrects

    expect(res.status).toBe(200);  // la connexion réussit
    expect(res.body).toHaveProperty('token');  // le serveur renvoie un token
    expect(res.body.user.email).toBe(testEmail);  // email retourné est correct
  });

  it('devrait refuser un mauvais mot de passe', async () => {  
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: 'mauvais_mdp' });  // mauvais mot de passe

    expect(res.status).toBe(401);  // le serveur renvoie une erreur 401
  });

  it('devrait refuser un email inexistant', async () => {  
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'inexistant@healis.fr', password: testPassword });  // email qui n'est pas dans la base

    expect(res.status).toBe(401);  // la connexion échoue
  });
});
