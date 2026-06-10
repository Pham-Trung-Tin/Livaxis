import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import User from '../models/user.model';
import { connectDB, disconnectDB } from '../config/database';

let mongoServer: MongoMemoryServer;

const testUser = {
  username: 'turnsuser',
  name: 'Turns User',
  email: 'turns@example.com',
  password: 'Password123!',
  confirmPassword: 'Password123!',
};

describe('Turns and Payment Integration API', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await connectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await disconnectDB();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should sign up with 0 purchased turns and 0 daily turns used', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send(testUser);
    expect(signupRes.status).toBe(201);
    expect(signupRes.body.data.user.aiTurns).toBe(0);
    expect(signupRes.body.data.user.aiTurnsUsed).toBe(0);
  });

  it('should track and decrement free/purchased turns correctly', async () => {
    // 1. Sign up and login
    await request(app).post('/api/auth/signup').send(testUser);
    const signin = await request(app).post('/api/auth/signin').send({
      username: testUser.username,
      password: testUser.password,
    });
    const cookies = signin.headers['set-cookie'];

    // 2. Check initial turns status
    let turnsRes = await request(app).get('/api/ai-room-planner/turns').set('Cookie', cookies);
    expect(turnsRes.status).toBe(200);
    expect(turnsRes.body.data.turnsRemaining).toBe(3); // 3 free turns
    expect(turnsRes.body.data.turnsUsed).toBe(0);
    expect(turnsRes.body.data.purchasedTurns).toBe(0);

    // 3. Mock generation turns 1, 2, 3
    // Simulate generation by calling GET /turns reset or triggering controller directly.
    // Let's call /api/ai-room-planner/generate which increments turns used.
    // Note: Since generateController calls generateInterior which might call external API or mock, 
    // let's see how generateInterior is mocked/implemented.
    // Let's mock a generate post call:
    const generatePayload = {
      roomImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      products: [
        { id: '1', name: 'Linen sofa', category: 'Sofa' }
      ],
      prompt: 'modern',
    };

    // First generate
    let genRes = await request(app)
      .post('/api/ai-room-planner/generate')
      .set('Cookie', cookies)
      .send(generatePayload);
    expect(genRes.status).toBe(200);
    expect(genRes.body.data.turnsInfo.turnsRemaining).toBe(2);
    expect(genRes.body.data.turnsInfo.turnsUsed).toBe(1);
    expect(genRes.body.data.turnsInfo.purchasedTurns).toBe(0);

    // Second generate
    genRes = await request(app)
      .post('/api/ai-room-planner/generate')
      .set('Cookie', cookies)
      .send(generatePayload);
    expect(genRes.status).toBe(200);
    expect(genRes.body.data.turnsInfo.turnsRemaining).toBe(1);
    expect(genRes.body.data.turnsInfo.turnsUsed).toBe(2);

    // Third generate
    genRes = await request(app)
      .post('/api/ai-room-planner/generate')
      .set('Cookie', cookies)
      .send(generatePayload);
    expect(genRes.status).toBe(200);
    expect(genRes.body.data.turnsInfo.turnsRemaining).toBe(0);
    expect(genRes.body.data.turnsInfo.turnsUsed).toBe(3);

    // Fourth generate should fail with AI_TURNS_EXHAUSTED
    genRes = await request(app)
      .post('/api/ai-room-planner/generate')
      .set('Cookie', cookies)
      .send(generatePayload);
    expect(genRes.status).toBe(429);
    expect(genRes.body.error.code).toBe('AI_TURNS_EXHAUSTED');

    // 4. Register order for package (e.g. Gói 2: 10 turns)
    const orderId = 'SUB123456';
    const regRes = await request(app)
      .post('/api/payment/register-order')
      .send({
        orderId,
        userId: signin.body.data.user.id,
        turnsToAdd: 10,
      });
    expect(regRes.status).toBe(200);

    // 5. Trigger webhook callback
    const webhookRes = await request(app)
      .post('/api/payment/webhook')
      .send({
        id: 99999,
        content: `Thanh toan don hang ${orderId}`,
        transferAmount: 19000,
        transferType: 'in',
        transactionDate: new Date().toISOString(),
      });
    expect(webhookRes.status).toBe(200);

    // 6. Check updated turns status
    turnsRes = await request(app).get('/api/ai-room-planner/turns').set('Cookie', cookies);
    expect(turnsRes.status).toBe(200);
    expect(turnsRes.body.data.turnsRemaining).toBe(10); // 0 free turns + 10 purchased turns
    expect(turnsRes.body.data.turnsUsed).toBe(3);
    expect(turnsRes.body.data.purchasedTurns).toBe(10);

    // 7. Generate using purchased turns
    genRes = await request(app)
      .post('/api/ai-room-planner/generate')
      .set('Cookie', cookies)
      .send(generatePayload);
    expect(genRes.status).toBe(200);
    expect(genRes.body.data.turnsInfo.turnsRemaining).toBe(9);
    expect(genRes.body.data.turnsInfo.turnsUsed).toBe(3); // stays at 3 free turns used limit
    expect(genRes.body.data.turnsInfo.purchasedTurns).toBe(9); // decremented from 10 to 9
  });
});
