import { Router } from 'express';
import { sePayWebhook, getPaymentStatus, getBankInfo } from '../controllers/payment.controller';

export const paymentRouter = Router();

/**
 * POST /api/payment/webhook
 * Endpoint nhận webhook từ SePay khi có biến động số dư.
 * Bảo mật bằng API Key (header: Authorization: Apikey <key>)
 */
paymentRouter.post('/webhook', sePayWebhook);

/**
 * GET /api/payment/status/:orderId
 * Cho phép FE polling trạng thái thanh toán của một đơn hàng.
 */
paymentRouter.get('/status/:orderId', getPaymentStatus);

/**
 * GET /api/payment/bank-info
 * Trả về thông tin tài khoản ngân hàng để FE tạo QR code.
 */
paymentRouter.get('/bank-info', getBankInfo);
