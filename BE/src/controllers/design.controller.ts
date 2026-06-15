import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import Design from '../models/design.model';

/**
 * POST /api/designs
 * Create/Save a new design
 */
export const createDesignController = asyncHandler(async (req: Request, res: Response) => {
  const { name, beforeImageUrl, afterImageUrl, products, prompt, stylePreset } = req.body;

  if (!name) {
    res.status(400).json({ success: false, error: { message: 'Tên thiết kế là bắt buộc' } });
    return;
  }

  if (!beforeImageUrl || !afterImageUrl) {
    res.status(400).json({ success: false, error: { message: 'Ảnh trước và sau thiết kế là bắt buộc' } });
    return;
  }

  const design = new Design({
    userId: req.user!.id,
    name,
    beforeImageUrl,
    afterImageUrl,
    products: products || [],
    prompt,
    stylePreset,
  });

  await design.save();

  res.status(201).json({
    success: true,
    message: 'Lưu thiết kế thành công',
    data: design,
  });
});

/**
 * GET /api/designs
 * List current user's designs
 */
export const listDesignsController = asyncHandler(async (req: Request, res: Response) => {
  const designs = await Design.find({ userId: req.user!.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: designs,
  });
});

/**
 * DELETE /api/designs/:id
 * Delete a design by ID
 */
export const deleteDesignController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const design = await Design.findById(id);

  if (!design) {
    res.status(404).json({ success: false, error: { message: 'Không tìm thấy thiết kế' } });
    return;
  }

  // Check ownership
  if (design.userId.toString() !== req.user!.id) {
    res.status(403).json({ success: false, error: { message: 'Bạn không có quyền xóa thiết kế này' } });
    return;
  }

  await design.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Xóa thiết kế thành công',
  });
});

/**
 * GET /api/designs/public/:id
 * Get a public design by ID (no auth required)
 */
export const getPublicDesignController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const design = await Design.findById(id);

  if (!design) {
    res.status(404).json({ success: false, error: { message: 'Không tìm thấy thiết kế' } });
    return;
  }

  res.status(200).json({
    success: true,
    data: design,
  });
});
