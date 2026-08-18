const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Importations des routes et middleware au format CommonJS
const authRouter = require('../routes/auth.routes.js');
const emotionLogsRouter = require('../routes/emotionLogs.routes.js');

// Middleware vérifie si l'utilisateur a fourni une clé d'accès (token JWT valide) avant de le laisser passer
const { authMiddleware } = require('../middlewares/auth.middleware.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);

// En plaçant 'authMiddleware' avant 'emotionLogsRouter', Express bloque automatiquement quiconque n'est pas authentifié
app.use('/emotion-logs', authMiddleware, emotionLogsRouter);

const testEmail = `emotiontest_${Date.now()}@healis.fr`;
let authToken = '';

// 'beforeAll' s'exécute automatiquement une seule fois AVANT tous les tests de ce fichier.
// ici, on crée un compte pour récupérer un token tout neuf utilisable dans tous les tests
beforeAll(async () => {
  const res = await request(app)
    .post('/auth/register')
    .send({ email: testEmail, password: 'Test1234!', firstName: 'Test' });
  authToken = res.body.token;
});

describe('EmotionLogs — /emotion-logs', () => {
  it("devrait créer un log d'émotion", async () => {
    const res = await request(app)
      .post('/emotion-logs')
      // .set() permet d'ajouter un en-tête HTTP.
      // 'Authorization: Bearer <token>' est le standard pour présenter son badge d'accès à l'API.
      .set('Authorization', `Bearer ${authToken}`)
      .send({ emotion: 'excellent', intensity: 5 });

    expect(res.status).toBe(201);  // 201 indique que la donnée a bien été enregistrée
    expect(res.body.emotion).toBe('excellent');
  });

  it('devrait récupérer les émotions du jour', async () => {
    const res = await request(app)
      .get('/emotion-logs')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);  // 200 indique que la récupération a réussi
    // Array.isArray vérifie que la réponse renvoyée est bien une liste (tableau [])
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('devrait refuser sans émotion', async () => {
    const res = await request(app)
      .post('/emotion-logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ intensity: 5 });

    expect(res.status).toBe(400);  // 400 car la validation des données côté serveur doit rejeter une requête incomplète
  });

  it('devrait refuser sans token', async () => {
    const res = await request(app)
      .get('/emotion-logs');

    expect(res.status).toBe(401);  // 401 : authMiddleware bloque la requête car le badge est absent
  });
});