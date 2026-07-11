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
app.use('/auth', authRouter);
app.use('/emotion-logs', authMiddleware, emotionLogsRouter);

const testEmail = `emotiontest_${Date.now()}@healis.fr`;
let authToken = '';

beforeAll(async () => {
  const res = await request(app)
    .post('/auth/register')
    .send({ email: testEmail, password: 'Test1234!', firstName: 'Test' });
  authToken = res.body.token;
});

describe('EmotionLogs — /emotion-logs', () => {
  it('devrait créer un log d\'émotion', async () => {
    const res = await request(app)
      .post('/emotion-logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ emotion: 'excellent', intensity: 5 });

    expect(res.status).toBe(201);
    expect(res.body.emotion).toBe('excellent');
  });

  it('devrait récupérer les émotions du jour', async () => {
    const res = await request(app)
      .get('/emotion-logs')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('devrait refuser sans émotion', async () => {
    const res = await request(app)
      .post('/emotion-logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ intensity: 5 });

    expect(res.status).toBe(400);
  });

  it('devrait refuser sans token', async () => {
    const res = await request(app)
      .get('/emotion-logs');

    expect(res.status).toBe(401);
  });
});
