import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole, ROLES } from '../middlewares/permission.middleware';
import {
  getAdminDashboardController,
  getSubscriptionStatsController,
  listAdminProductsController,
  listAdminUsersController,
  updateUserStatusController,
} from '../controllers/admin.controller';

const adminRouter = Router();

adminRouter.use(authenticate, checkRole(ROLES.ADMIN));

adminRouter.get('/dashboard', getAdminDashboardController);
adminRouter.get('/users', listAdminUsersController);
adminRouter.patch('/users/:id/status', updateUserStatusController);
adminRouter.get('/products', listAdminProductsController);
adminRouter.get('/subscriptions', getSubscriptionStatsController);

export { adminRouter };
