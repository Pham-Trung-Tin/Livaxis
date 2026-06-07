import multer from 'multer';
import { AppError } from '../utils/appError';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_AVATAR_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new AppError(400, 'INVALID_FILE_TYPE', 'Chỉ cho phép tải lên các tệp hình ảnh'));
      return;
    }

    cb(null, true);
  },
});
