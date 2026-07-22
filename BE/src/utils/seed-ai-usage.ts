import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import AiDailyUsage from '../models/aiDailyUsage.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const CHART_DATA = {
  roomTryOn: [165, 190, 175, 210, 155, 185, 175, 200, 165, 190, 175, 165, 185, 195, 170, 165, 180, 175, 190, 205, 175, 160, 175, 185, 170, 180, 195, 175, 170, 160],
  roomPlanner: [85, 95, 80, 90, 75, 100, 85, 90, 80, 95, 85, 80, 90, 95, 80, 85, 90, 80, 95, 100, 85, 80, 85, 90, 80, 85, 90, 80, 85, 80],
};

const runSeeder = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const today = new Date();
    
    // We have 30 days of data, so we go back 29 days up to today.
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (29 - i));
      const dateStr = d.toISOString().split('T')[0];
      
      const tryOnVal = CHART_DATA.roomTryOn[i];
      const plannerVal = CHART_DATA.roomPlanner[i];

      await AiDailyUsage.findOneAndUpdate(
        { date: dateStr },
        { 
          roomTryOn: tryOnVal,
          roomPlanner: plannerVal
        },
        { upsert: true, new: true }
      );
      console.log(`Seeded usage for ${dateStr}: tryOn=${tryOnVal}, planner=${plannerVal}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

runSeeder();
