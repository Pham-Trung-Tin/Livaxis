import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { generateInterior, getAiStatus, removeProductBackground } from '../services/aiRoomPlanner.service';

export const getStatusController = asyncHandler(async (_req: Request, res: Response) => {
  const status = getAiStatus();
  res.status(200).json({ success: true, data: status });
});

export const generateController = asyncHandler(async (req: Request, res: Response) => {
  const result = await generateInterior(req.body);
  res.status(200).json({ success: true, data: result });
});

export const removeBackgroundController = asyncHandler(async (req: Request, res: Response) => {
  const result = await removeProductBackground(req.body);
  res.status(200).json({ success: true, data: result });
});
