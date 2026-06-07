import type { NextFunction, Request, Response } from 'express';
import User from '../models/user.model';
import { AppError } from '../utils/appError';

/** Number of free AI turns granted to users without an active subscription, per day */
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
 * - Paid subscribers (starter / standard / premium) are not rate-limited by this middleware.
 * - Free users get FREE_DAILY_TURNS turns per UTC day; the counter resets automatically.
 * - Attaches `req.user.aiTurnsRemaining` so the controller can return it in the response.
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

  // Paid subscribers are not limited by daily free turns
  if (user.subscriptionPlan) {
    // Still attach info for convenience
    (req as any).aiTurnsInfo = { unlimited: true, subscriptionPlan: user.subscriptionPlan };
    next();
    return;
  }

  // Reset counter at the start of a new UTC day
  if (isNewDay(user.aiTurnsResetAt)) {
    user.aiTurnsUsed = 0;
    user.aiTurnsResetAt = new Date();
    await user.save();
  }

  const turnsUsed = user.aiTurnsUsed ?? 0;
  const turnsRemaining = Math.max(0, FREE_DAILY_TURNS - turnsUsed);

  if (turnsRemaining <= 0) {
    next(
      new AppError(
        429,
        'AI_TURNS_EXHAUSTED',
        `Bạn đã sử dụng hết ${FREE_DAILY_TURNS} lượt thử AI miễn phí của ngày hôm nay. Hãy nâng cấp gói dịch vụ hoặc thử lại vào ngày mai.`,
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
  };

  next();
};

/**
 * Helper called by the controller AFTER a successful generate to increment the counter.
 * Only increments for free users (paid subscribers are not tracked).
 */
export async function incrementAiTurnsUsed(userId: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user || user.subscriptionPlan) return;

  user.aiTurnsUsed = (user.aiTurnsUsed ?? 0) + 1;
  await user.save();
}
