import { connectDB, disconnectDB } from '../config/database';
import Product from '../models/product.model';

const seedProducts = [
  {
    name: 'Serene Linen Sofa',
    subtitle: 'Cloud-soft performance linen - 2026',
    category: 'Sofas',
    price: 4890,
    imageUrl: 'https://images.unsplash.com/photo-1759722668767-3f9cb7468b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Designed for calm interiors with a tailored profile and deep seating comfort.',
    style: 'Modern Luxury',
    dimensions: '248cm x 102cm x 78cm',
    material: 'Linen',
    color: 'Ivory',
    colorHex: '#F5F0E8',
    isNew: true,
    stock: 12,
  },
  {
    name: 'Carrara Side Table',
    subtitle: 'Hand-cut Italian marble base',
    category: 'Tables',
    price: 2290,
    imageUrl: 'https://images.unsplash.com/photo-1765766638341-0beb9eb9926c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Minimal side table sculpted from Carrara marble and brushed metal detailing.',
    style: 'Minimalist',
    dimensions: '52cm x 52cm x 48cm',
    material: 'Marble',
    color: 'Ivory',
    colorHex: '#F5F0E8',
    isNew: true,
    stock: 8,
  },
  {
    name: 'Walnut Lounge Chair',
    subtitle: 'Solid black walnut, hand-oiled finish',
    category: 'Chairs',
    price: 3140,
    imageUrl: 'https://images.unsplash.com/photo-1762803841091-c5327f7aed37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Crafted from black walnut with ergonomic back support and premium joinery.',
    style: 'Industrial',
    dimensions: '74cm x 78cm x 84cm',
    material: 'Walnut',
    color: 'Charcoal',
    colorHex: '#3D3D3D',
    isNew: true,
    stock: 6,
  },
  {
    name: 'Atelier Brass Pendant',
    subtitle: 'Spun brass with antique patina',
    category: 'Lighting',
    price: 1480,
    imageUrl: 'https://images.unsplash.com/photo-1767979066193-83dffc4a4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Pendant light with sculptural form and warm reflective brass surface.',
    style: 'Modern Luxury',
    dimensions: '46cm x 46cm x 30cm',
    material: 'Brass',
    color: 'Sand',
    colorHex: '#C9B99A',
    isNew: false,
    stock: 20,
  },
  {
    name: 'Nordic Oak Dining Table',
    subtitle: 'FSC-certified solid white oak',
    category: 'Tables',
    price: 5640,
    imageUrl: 'https://images.unsplash.com/photo-1772442363851-738a548f6c5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Large-format dining table with soft radiused corners and Scandinavian finish.',
    style: 'Minimalist',
    dimensions: '260cm x 104cm x 75cm',
    material: 'Oak',
    color: 'Sand',
    colorHex: '#C9B99A',
    isNew: true,
    stock: 18,
  },
  {
    name: 'Boucle Accent Chair',
    subtitle: 'Tufted boucle weave, gilt legs',
    category: 'Chairs',
    price: 2950,
    imageUrl: 'https://images.unsplash.com/photo-1768946131690-247c5319f0d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Tufted accent chair with plush seating and polished metal base details.',
    style: 'Modern Luxury',
    dimensions: '76cm x 74cm x 82cm',
    material: 'Velvet',
    color: 'Ivory',
    colorHex: '#F5F0E8',
    isNew: true,
    stock: 9,
  },
  {
    name: 'Rattan Shelf System',
    subtitle: 'Woven rattan, ash wood frame',
    category: 'Storage',
    price: 1890,
    imageUrl: 'https://images.unsplash.com/photo-1734120113877-ef06ed3a10f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Open shelf system combining warm ash framing with woven rattan panels.',
    style: 'Modern Luxury',
    dimensions: '132cm x 38cm x 188cm',
    material: 'Rattan',
    color: 'Sand',
    colorHex: '#C9B99A',
    isNew: false,
    stock: 7,
  },
  {
    name: 'Travertine Coffee Table',
    subtitle: 'Roman travertine, unlacquered iron',
    category: 'Tables',
    price: 3780,
    imageUrl: 'https://images.unsplash.com/photo-1755770355297-1526e33a3c82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Coffee table in natural travertine with minimal black iron structure.',
    style: 'Industrial',
    dimensions: '138cm x 74cm x 34cm',
    material: 'Travertine',
    color: 'Ivory',
    colorHex: '#F5F0E8',
    isNew: true,
    stock: 14,
  },
  {
    name: 'Velvet Chaise Lounge',
    subtitle: 'Performance velvet, blackened brass',
    category: 'Sofas',
    price: 4320,
    imageUrl: 'https://images.unsplash.com/photo-1759774313258-b0111fb75cbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Chaise lounge built for statement corners with durable velvet upholstery.',
    style: 'Minimalist',
    dimensions: '188cm x 86cm x 78cm',
    material: 'Velvet',
    color: 'Charcoal',
    colorHex: '#3D3D3D',
    isNew: true,
    stock: 16,
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
