import { Router } from 'express';
import {
  generateController,
  getStatusController,
  getTurnsController,
  removeBackgroundController,
} from '../controllers/aiRoomPlanner.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkAiTurns } from '../middlewares/aiTurns.middleware';

const aiRoomPlannerRouter = Router();

// Public — no auth needed
aiRoomPlannerRouter.get('/status', getStatusController);
aiRoomPlannerRouter.post('/remove-background', removeBackgroundController);

// Protected — must be logged in
aiRoomPlannerRouter.get('/turns', authenticate, getTurnsController);

// Protected + turn-limited
aiRoomPlannerRouter.post('/generate', authenticate, checkAiTurns, generateController);

export { aiRoomPlannerRouter };
