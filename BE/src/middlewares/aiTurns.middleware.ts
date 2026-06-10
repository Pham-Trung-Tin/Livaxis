import type { NextFunction, Request, Response } from 'express';
import User from '../models/user.model';
import { AppError } from '../utils/appError';

/** Number of free AI turns granted to users per day */
const FREE_DAILY_TURNS = 3;

/** Returns true if the reset timestamp is from a previous calendar day (UTC) */
function isNewDay(resetAt: Date): boolean {
  const now = new Date();
  return (
    resetAt.getUTCFullYear() !== now.getUTCFullYear() ||
    resetAt.getUTCMonth() !== now.getUTCMonth() ||
    resetAt.getUTCDate() !== now.getUTCDate()
  );
}

/**
 * Middleware: checks whether the authenticated user has remaining AI turns.
 * - Every user gets FREE_DAILY_TURNS free turns per UTC day.
 * - Additionally, they can use purchased turns (aiTurns).
 * - Attaches `aiTurnsInfo` for standard API responses.
 * Must be placed after the `authenticate` middleware.
 */
export const checkAiTurns = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.user?.id) {
    next(new AppError(401, 'UNAUTHORIZED', 'Thiếu thông tin người dùng'));
    return;
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    next(new AppError(401, 'UNAUTHORIZED', 'Không tìm thấy người dùng'));
    return;
  }

  // Reset counter at the start of a new UTC day
  if (isNewDay(user.aiTurnsResetAt)) {
    user.aiTurnsUsed = 0;
    user.aiTurnsResetAt = new Date();
    await user.save();
  }

  const turnsUsed = user.aiTurnsUsed ?? 0;
  const freeTurnsRemaining = Math.max(0, FREE_DAILY_TURNS - turnsUsed);
  const purchasedTurnsRemaining = Math.max(0, user.aiTurns ?? 0);
  const turnsRemaining = freeTurnsRemaining + purchasedTurnsRemaining;

  if (turnsRemaining <= 0) {
    next(
      new AppError(
        429,
        'AI_TURNS_EXHAUSTED',
        `Bạn đã sử dụng hết lượt thử AI miễn phí hôm nay và lượt mua thêm. Hãy mua thêm lượt sử dụng hoặc thử lại vào ngày mai.`,
        { turnsUsed, turnsRemaining: 0, dailyLimit: FREE_DAILY_TURNS },
      ),
    );
    return;
  }

  // Attach turn info to the request for the controller to consume
  (req as any).aiTurnsInfo = {
    unlimited: false,
    turnsUsed,
    turnsRemaining,
    dailyLimit: FREE_DAILY_TURNS,
    purchasedTurns: purchasedTurnsRemaining,
  };

  next();
};

/**
 * Helper called by the controller AFTER a successful generate to increment the counter.
 * Uses daily free turns first, then decrements purchased balance.
 */
export async function incrementAiTurnsUsed(userId: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user) return;

  if ((user.aiTurnsUsed ?? 0) < FREE_DAILY_TURNS) {
    user.aiTurnsUsed = (user.aiTurnsUsed ?? 0) + 1;
  } else {
    user.aiTurns = Math.max(0, (user.aiTurns ?? 0) - 1);
  }
  await user.save();
}
