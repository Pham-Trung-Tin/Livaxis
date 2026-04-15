import { Router } from 'express';
import {
  createProductController,
  deleteProductController,
  getProductByIdController,
  listDiscoveryController,
  listProductsController,
  updateProductController,
} from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole, ROLES } from '../middlewares/permission.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createProductSchema, productIdSchema, updateProductSchema } from '../validators/product.validator';

const productRouter = Router();

productRouter.get('/', listProductsController);
productRouter.get('/discovery', listDiscoveryController);
productRouter.get('/:id', validateRequest(productIdSchema), getProductByIdController);

productRouter.post(
  '/',
  authenticate,
  checkRole(ROLES.ADMIN),
  validateRequest(createProductSchema),
  createProductController,
);

productRouter.patch(
  '/:id',
  authenticate,
  checkRole(ROLES.ADMIN),
  validateRequest(updateProductSchema),
  updateProductController,
);

productRouter.delete(
  '/:id',
  authenticate,
  checkRole(ROLES.ADMIN),
  validateRequest(productIdSchema),
  deleteProductController,
);

export { productRouter };
