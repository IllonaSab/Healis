const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Importation de tes routes au format CommonJS
const authRouter = require('../routes/auth.routes.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);

const testEmail = `test_${Date.now()}@healis.fr`;
const testPassword = 'Test1234!';
let authToken = '';

describe('Auth — /auth/register', () => {
  console.log('DB URL:', process.env.DATABASE_URL);

  it('devrait créer un compte avec email/password/firstName', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword, firstName: 'Test' });

    console.log('Response body:', res.body);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testEmail);
    authToken = res.body.token;
  });

  it('devrait refuser un email déjà utilisé', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword, firstName: 'Test' });

    expect(res.status).toBe(409);
  });

  it('devrait refuser si email manquant', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ password: testPassword });

    expect(res.status).toBe(400);
  });
});

describe('Auth — /auth/login', () => {
  it('devrait connecter un utilisateur existant', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testEmail);
  });

  it('devrait refuser un mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: 'mauvais_mdp' });

    expect(res.status).toBe(401);
  });

  it('devrait refuser un email inexistant', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'inexistant@healis.fr', password: testPassword });

    expect(res.status).toBe(401);
  });
});