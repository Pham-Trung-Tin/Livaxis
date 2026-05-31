import bcrypt from 'bcrypt';
import { connectDB, disconnectDB } from '../config/database';
import User from '../models/user.model';

const ADMIN = {
  username: 'superadmin',
  name: 'Super Admin',
  email: 'admin@livaxis.com',
  password: 'Admin@123456',
};

const runSeed = async (): Promise<void> => {
  try {
    await connectDB();

    const existing = await User.findOne({
      $or: [{ email: ADMIN.email }, { username: ADMIN.username }],
    });

    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin' as any;
        existing.emailVerified = true;
        existing.isActive = true;
        await existing.save();
        console.log(`Updated existing user "${existing.email}" to role=admin.`);
      } else {
        console.log(`Admin account already exists: ${existing.email}`);
      }
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN.password, 12);

    await User.create({
      username: ADMIN.username,
      name: ADMIN.name,
      email: ADMIN.email,
      passwordHash,
      role: 'admin',
      emailVerified: true,
      isActive: true,
      aiTurns: 9999,
      aiTurnsUsed: 0,
    });

    console.log('✓ Admin account created:');
    console.log(`  Email   : ${ADMIN.email}`);
    console.log(`  Username: ${ADMIN.username}`);
    console.log(`  Password: ${ADMIN.password}`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

void runSeed();
