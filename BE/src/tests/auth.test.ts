import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import User from '../models/user.model';
import { connectDB, disconnectDB } from '../config/database';

let mongoServer: MongoMemoryServer;

const createUserPayload = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123!',
};

describe('Auth API', () => {
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

  it('should signup successfully', async () => {
    const response = await request(app).post('/api/auth/signup').send(createUserPayload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(createUserPayload.email);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should signin and return cookies', async () => {
    await request(app).post('/api/auth/signup').send(createUserPayload);

    const response = await request(app).post('/api/auth/signin').send({
      email: createUserPayload.email,
      password: createUserPayload.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should protect /me when token is missing', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return /me profile when authenticated', async () => {
    await request(app).post('/api/auth/signup').send(createUserPayload);
    const signin = await request(app).post('/api/auth/signin').send({
      email: createUserPayload.email,
      password: createUserPayload.password,
    });

    const cookies = signin.headers['set-cookie'];
    const response = await request(app).get('/api/auth/me').set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(createUserPayload.email);
  });
});
