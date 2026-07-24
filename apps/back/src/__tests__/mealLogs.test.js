const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Importations des routes et middleware au format CommonJS
const authRouter = require('../routes/auth.routes.js');
const mealLogsRouter = require('../routes/mealLogs.routes.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);
app.use('/meal-logs', authMiddleware, mealLogsRouter);

const testEmail = `mealtest_${Date.now()}@healis.fr`;
let authToken = '';
let createdMealId = '';

beforeAll(async () => {
  const res = await request(app)
    .post('/auth/register')
    .send({ email: testEmail, password: 'Test1234!', firstName: 'Test' });
  authToken = res.body.token;
});

describe('MealLogs — /meal-logs', () => {
  it('devrait créer un repas', async () => {
    const res = await request(app)
      .post('/meal-logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ mealType: 'PETIT_DEJEUNER', title: 'Porridge test' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Porridge test');
    createdMealId = res.body.id;
  });

  it('devrait récupérer les repas du jour', async () => {
    const res = await request(app)
      .get('/meal-logs')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('devrait mettre à jour un repas', async () => {
    const res = await request(app)
      .patch(`/meal-logs/${createdMealId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ eaten: true });

    expect(res.status).toBe(200);
    expect(res.body.eaten).toBe(true);
  });

  it('devrait refuser sans token', async () => {
    const res = await request(app)
      .get('/meal-logs');

    expect(res.status).toBe(401);
  });
});