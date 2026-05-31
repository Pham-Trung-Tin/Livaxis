import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getAdminDashboardStats,
  getSubscriptionStats,
  listAdminProducts,
  listAdminUsers,
  updateUserStatus,
} from '../services/admin.service';

export const listAdminUsersController = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  const result = await listAdminUsers({ page, limit, search });

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const updateUserStatusController = asyncHandler(async (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { isActive } = req.body as { isActive: boolean };

  if (!id) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_USER_ID',
        message: 'Missing user id',
      },
    });
    return;
  }

  await updateUserStatus(id, isActive);

  res.status(200).json({
    success: true,
    message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
  });
});

export const getAdminDashboardController = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getAdminDashboardStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

export const listAdminProductsController = asyncHandler(async (_req: Request, res: Response) => {
  const result = await listAdminProducts();

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getSubscriptionStatsController = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getSubscriptionStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});
