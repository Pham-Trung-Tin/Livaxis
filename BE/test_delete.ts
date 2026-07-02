import { connect } from 'mongoose';
import Feedback from './src/models/feedback.model';

async function test() {
  await connect('mongodb://localhost:27017/livaxis'); // assuming local db
  console.log('connected');
  const feed = await Feedback.findOne();
  if(feed) {
    console.log('deleting', feed._id);
    await Feedback.findByIdAndDelete(feed._id);
    console.log('deleted');
  } else {
    console.log('no feedbacks');
  }
  process.exit(0);
}
test().catch(console.error);
