import { Router } from 'express';
import {
  createDesignController,
  listDesignsController,
  deleteDesignController,
  getPublicDesignController,
} from '../controllers/design.controller';
import { authenticate } from '../middlewares/auth.middleware';

const designRouter = Router();

// Public routes (no auth required)
designRouter.get('/public/:id', getPublicDesignController);

// All design routes below are protected by the authentication middleware
designRouter.use(authenticate);

designRouter.post('/', createDesignController);
designRouter.get('/', listDesignsController);
designRouter.delete('/:id', deleteDesignController);

export { designRouter };
