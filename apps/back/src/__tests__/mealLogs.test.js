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
// On protège lesroutes '/meal-logs' avec le middleware d'authentification
app.use('/meal-logs', authMiddleware, mealLogsRouter);

const testEmail = `mealtest_${Date.now()}@healis.fr`;
let authToken = '';
// Variable globale au fichier qui va mémoriser l'identifiant unique (ID) du repas créé pour pouvoir le réutiliser plus tard
let createdMealId = '';

// On crée un compte avant tous les tests pour obtenir un token de session valide
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

    // 201 confirme l'enregistrement du repas
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Porridge test');
    // On sauvegarde l'ID généré par la base de données (ex: "meal_123") dans notre variable
    createdMealId = res.body.id;
  });

  it('devrait récupérer les repas du jour', async () => {
    const res = await request(app)
      .get('/meal-logs')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    // On vérifie qu'on reçoit bien une liste de repas
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('devrait mettre à jour un repas', async () => {
    // PATCH sert à modifier partiellement une ressource existante (ici changer uniquement le statut 'eaten').
    // On injecte dynamiquement l'ID du repas dans l'URL grâce aux template literals (`.../${createdMealId}`)
    const res = await request(app)
      .patch(`/meal-logs/${createdMealId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ eaten: true });

    // 200 indique que la modification a bien été prise en compte
    expect(res.status).toBe(200);
    // On vérifie que la valeur booléenne 'eaten' est bien passée à true
    expect(res.body.eaten).toBe(true);
  });

  it('devrait refuser sans token', async () => {
    // Tentative d'accès non autorisée
    const res = await request(app)
      .get('/meal-logs');

    // 401 : aucun jeton n'a été fourni dans les headers
    expect(res.status).toBe(401);
  });
});