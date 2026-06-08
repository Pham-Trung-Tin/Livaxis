import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { generateInterior, getAiStatus, getAutoPositions, detectFloorLine, removeProductBackground } from '../services/aiRoomPlanner.service';
import { incrementAiTurnsUsed } from '../middlewares/aiTurns.middleware';
import User from '../models/user.model';

const FREE_DAILY_TURNS = 100;

/** GET /api/ai-room-planner/status — provider status */
export const getStatusController = asyncHandler(async (_req: Request, res: Response) => {
  const status = getAiStatus();
  res.status(200).json({ success: true, data: status });
});

/** GET /api/ai-room-planner/turns — current user's turn quota */
export const getTurnsController = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);

  if (!user) {
    res.status(404).json({ success: false, error: { message: 'Không tìm thấy người dùng' } });
    return;
  }

  if (user.subscriptionPlan) {
    res.status(200).json({
      success: true,
      data: {
        unlimited: true,
        subscriptionPlan: user.subscriptionPlan,
        turnsUsed: null,
        turnsRemaining: null,
        dailyLimit: null,
      },
    });
    return;
  }

  // Reset if a new UTC day has started
  const now = new Date();
  const resetAt = user.aiTurnsResetAt ?? new Date(0);
  const isNewDay =
    resetAt.getUTCFullYear() !== now.getUTCFullYear() ||
    resetAt.getUTCMonth() !== now.getUTCMonth() ||
    resetAt.getUTCDate() !== now.getUTCDate();

  let turnsUsed = user.aiTurnsUsed ?? 0;
  if (isNewDay) {
    turnsUsed = 0;
  }

  const turnsRemaining = Math.max(0, FREE_DAILY_TURNS - turnsUsed);

  res.status(200).json({
    success: true,
    data: {
      unlimited: false,
      subscriptionPlan: null,
      turnsUsed,
      turnsRemaining,
      dailyLimit: FREE_DAILY_TURNS,
    },
  });
});

/** POST /api/ai-room-planner/generate — generate room */
export const generateController = asyncHandler(async (req: Request, res: Response) => {
  const result = await generateInterior(req.body);

  // Increment counter for free users after a successful generation (only if authenticated)
  let turnsInfo: Record<string, unknown> = { unlimited: true };

  if (req.user?.id) {
    await incrementAiTurnsUsed(req.user.id);

    // Re-read the updated turn info for the response
    const user = await User.findById(req.user.id);
    if (user && !user.subscriptionPlan) {
      const turnsUsed = user.aiTurnsUsed ?? 0;
      turnsInfo = {
        unlimited: false,
        turnsUsed,
        turnsRemaining: Math.max(0, FREE_DAILY_TURNS - turnsUsed),
        dailyLimit: FREE_DAILY_TURNS,
      };
    }
  }

  res.status(200).json({ success: true, data: { ...result, turnsInfo } });
});

/** POST /api/ai-room-planner/auto-position — AI analyzes room and suggests product positions */
export const autoPositionController = asyncHandler(async (req: Request, res: Response) => {
  const { roomImage, products } = req.body;
  const positions = await getAutoPositions(roomImage, products);
  res.status(200).json({ success: true, data: positions });
});

/** POST /api/ai-room-planner/remove-background */
export const removeBackgroundController = asyncHandler(async (req: Request, res: Response) => {
  const result = await removeProductBackground(req.body);
  res.status(200).json({ success: true, data: result });
});

/** POST /api/ai-room-planner/detect-floor — AI detects floor line in room image */
export const detectFloorController = asyncHandler(async (req: Request, res: Response) => {
  const { roomImage } = req.body;
  const result = await detectFloorLine(roomImage);
  res.status(200).json({ success: true, data: result });
});
