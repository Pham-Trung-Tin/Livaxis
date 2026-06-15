import { Router } from 'express';
import {
  createDesignController,
  listDesignsController,
  deleteDesignController,
} from '../controllers/design.controller';
import { authenticate } from '../middlewares/auth.middleware';

const designRouter = Router();

// All design routes are protected by the authentication middleware
designRouter.use(authenticate);

designRouter.post('/', createDesignController);
designRouter.get('/', listDesignsController);
designRouter.delete('/:id', deleteDesignController);

export { designRouter };
