import { connectDB, disconnectDB } from '../config/database';
import Product from '../models/product.model';

const seedProducts = [
  {
    name: 'Aeron Lounge Chair',
    category: 'Lounge Chair',
    price: 1299,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
    description: 'A sculpted lounge chair with premium cushioning for all-day comfort.',
    style: 'Modern Luxury',
    dimensions: '84cm x 82cm x 91cm',
    material: 'Italian Leather',
    stock: 12,
  },
  {
    name: 'Linea Sofa Set',
    category: 'Seating',
    price: 2190,
    imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a',
    description: 'A modular seating set with deep seats and a minimalist silhouette.',
    style: 'Minimalist',
    dimensions: '260cm x 98cm x 78cm',
    material: 'Linen Blend',
    stock: 8,
  },
  {
    name: 'Orion Dining Table',
    category: 'Dining',
    price: 1750,
    imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601',
    description: 'A solid oak dining table designed for six to eight people.',
    style: 'Industrial',
    dimensions: '220cm x 95cm x 75cm',
    material: 'Oak Wood',
    stock: 6,
  },
  {
    name: 'Halo Pendant Lamp',
    category: 'Lighting',
    price: 420,
    imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4',
    description: 'A suspended pendant with warm diffusion and brushed metal finish.',
    style: 'Modern Luxury',
    dimensions: '45cm x 45cm x 28cm',
    material: 'Brass and Frosted Glass',
    stock: 20,
  },
  {
    name: 'Ridge Accent Stool',
    category: 'Accent',
    price: 280,
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126',
    description: 'A compact accent stool that doubles as a side table.',
    style: 'Minimalist',
    dimensions: '38cm x 38cm x 46cm',
    material: 'Ash Wood',
    stock: 18,
  },
  {
    name: 'Vault Sideboard',
    category: 'Storage',
    price: 1380,
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-3f2b1fa0f7f6',
    description: 'A wide sideboard with push-to-open doors and flexible shelving.',
    style: 'Modern Luxury',
    dimensions: '180cm x 48cm x 82cm',
    material: 'Walnut Veneer',
    stock: 9,
  },
  {
    name: 'Cloud Recliner',
    category: 'Lounge Chair',
    price: 1490,
    imageUrl: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9',
    description: 'An ergonomic recliner with plush support and seamless motion.',
    style: 'Modern Luxury',
    dimensions: '92cm x 88cm x 103cm',
    material: 'Top Grain Leather',
    stock: 7,
  },
  {
    name: 'Axis Bench',
    category: 'Seating',
    price: 690,
    imageUrl: 'https://images.unsplash.com/photo-1551298370-9d3d53740c72',
    description: 'A clean-lined bench suitable for hallways, bedrooms, or lounge areas.',
    style: 'Industrial',
    dimensions: '140cm x 42cm x 45cm',
    material: 'Powder-Coated Steel and Oak',
    stock: 14,
  },
  {
    name: 'Nova Floor Light',
    category: 'Lighting',
    price: 510,
    imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15',
    description: 'A slim floor lamp with adjustable head and ambient glow.',
    style: 'Minimalist',
    dimensions: '35cm x 35cm x 165cm',
    material: 'Aluminum',
    stock: 16,
  },
  {
    name: 'Drift Console Cabinet',
    category: 'Storage',
    price: 990,
    imageUrl: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a',
    description: 'A narrow console cabinet designed for compact modern living.',
    style: 'Minimalist',
    dimensions: '120cm x 40cm x 80cm',
    material: 'Engineered Wood',
    stock: 11,
  },
] as const;

const LEGACY_INDEXES = ['slug_1', 'sku_1'] as const;

const dropLegacyIndexes = async (): Promise<void> => {
  const indexes = await Product.collection.indexes();
  const indexNames = new Set(indexes.map((index) => index.name));

  for (const indexName of LEGACY_INDEXES) {
    if (!indexNames.has(indexName)) {
      continue;
    }

    await Product.collection.dropIndex(indexName);
    console.log(`Dropped legacy index: ${indexName}`);
  }
};

const runSeed = async (): Promise<void> => {
  try {
    await connectDB();

    await dropLegacyIndexes();

    await Product.deleteMany({});
    const inserted = await Product.insertMany(seedProducts);

    console.log(`Seed completed: inserted ${inserted.length} products.`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

void runSeed();
