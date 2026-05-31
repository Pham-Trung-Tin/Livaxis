import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import Product from '../models/product.model';
import { connectDB, disconnectDB } from '../config/database';

let mongoServer: MongoMemoryServer;

const productOne = {
  name: 'Valencia Velvet Sofa',
  subtitle: 'Emerald Forest · Velvet',
  category: 'Sofas' as const,
  price: 4890,
  imageUrl: 'https://example.com/sofa.jpg',
  description: 'A luxury velvet sofa.',
  style: 'Modern Luxury' as const,
  material: 'Velvet',
  color: 'Emerald Forest',
  colorHex: '#0f5132',
  isNew: true,
  stock: 4,
};

const productTwo = {
  name: 'Carrara Coffee Table',
  subtitle: 'Italian Marble · Brass Legs',
  category: 'Tables' as const,
  price: 2780,
  imageUrl: 'https://example.com/table.jpg',
  description: 'A marble coffee table.',
  style: 'Modern Luxury' as const,
  material: 'Marble',
  color: 'White',
  colorHex: '#f7f7f5',
  isNew: false,
  stock: 2,
};

describe('Products API', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await connectDB();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  afterAll(async () => {
    await disconnectDB();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should return products by ids for cart hydration', async () => {
    const createdOne = await Product.create(productOne);
    const createdTwo = await Product.create(productTwo);

    const response = await request(app)
      .get('/api/products/batch')
      .query({ ids: `${createdOne._id.toString()},${createdTwo._id.toString()}` });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items).toHaveLength(2);
    expect(response.body.data.missingIds).toHaveLength(0);
  });
});