import { connect } from 'mongoose';
import Feedback from './src/models/feedback.model';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await connect(process.env.MONGODB_URI as string);
  console.log('connected to atlas');
  const feed = await Feedback.find();
  console.log('feedbacks:', feed.map(f => f._id));
  process.exit(0);
}
test().catch(console.error);
