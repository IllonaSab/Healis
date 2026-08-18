// supertest: il va simuler de vraies requêtes HTTP (GET, POST...) vers notre serveur sans avoir à le lancer manuellement sur un port.
const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Importation de tes routes au format CommonJS
const authRouter = require('../routes/auth.routes.js');

// On crée une mini-application Express dédiée uniquement à exécuter ces tests
const app = express();
app.use(cors());
app.use(express.json());
// On branche nos routes d'authentification sur le préfixe '/auth'
app.use('/auth', authRouter);

// Date.now() donne le nombre de millisecondes actuelles : email unique à chaque test pour éviter les conflits BDD
const testEmail = `test_${Date.now()}@healis.fr`;
const testPassword = 'Test1234!';
let authToken = '';

// Regrouper visuellement une suite de tests
describe('Auth — /auth/register', () => {
  console.log('DB URL:', process.env.DATABASE_URL);

  // 'it' décrit un scénario précis
  it('devrait créer un compte avec email/password/firstName', async () => {
    const res = await request(app)
      .post('/auth/register') // On envoie une requête POST
      .send({ email: testEmail, password: testPassword, firstName: 'Test' });

    console.log('Response body:', res.body);

    expect(res.status).toBe(201);  // Le code HTTP 201 (Created / Ressource créée avec succès)
    expect(res.body).toHaveProperty('token'); // La réponse contient bien la clé "token"
    expect(res.body.user.email).toBe(testEmail); // On vérifie que l'email renvoyé correspond
    authToken = res.body.token; // On stocke le token généré
  });

  it('devrait refuser un email déjà utilisé', async () => {
  // On réessaie d'enregistrer le même email : l'API bloque le doublon
    const res = await request(app)
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword, firstName: 'Test' });

    expect(res.status).toBe(409); // 409 indique que le email existe déjà
  });

  it('devrait refuser si email manquant', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ password: testPassword });

    expect(res.status).toBe(400); // 400 indique que la requête est incomplète ou mal formée
  });
});

describe('Auth — /auth/login', () => {
  it('devrait connecter un utilisateur existant', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);  // 200 confirme la réussite de la connexion
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testEmail);
  });

  it('devrait refuser un mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: 'mauvais_mdp' });

    expect(res.status).toBe(401);  // 401 indique que l'authentification a échoué
  });

  it('devrait refuser un email inexistant', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'inexistant@healis.fr', password: testPassword });

    expect(res.status).toBe(401);  // 401 pour ne pas donner d'indice sur l'existence ou non du compte
  });
});