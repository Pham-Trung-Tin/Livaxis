import { Router } from 'express';
import {
  generateController,
  getStatusController,
  removeBackgroundController,
} from '../controllers/aiRoomPlanner.controller';

const aiRoomPlannerRouter = Router();

aiRoomPlannerRouter.get('/status', getStatusController);
aiRoomPlannerRouter.post('/remove-background', removeBackgroundController);
aiRoomPlannerRouter.post('/generate', generateController);

export { aiRoomPlannerRouter };
