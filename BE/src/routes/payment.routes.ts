import { Router } from 'express';
import { sePayWebhook, getPaymentStatus, getBankInfo, registerOrder } from '../controllers/payment.controller';

export const paymentRouter = Router();

/**
 * POST /api/payment/register-order
 * Called by the FE when a user opens the subscription payment modal.
 * Associates the SUB order ID with the authenticated user so aiTurns
 * can be credited after the SePay webhook confirms payment.
 */
paymentRouter.post('/register-order', registerOrder);

/**
 * POST /api/payment/webhook
 * Receives SePay webhook events (bank transfer notifications).
 * Secured with API Key (header: Authorization: Apikey <key>).
 * Only handles SUB subscription orders — credits aiTurns on payment.
 */
paymentRouter.post('/webhook', sePayWebhook);

/**
 * GET /api/payment/status/:orderId
 * Allows the FE to poll payment status for a given order.
 */
paymentRouter.get('/status/:orderId', getPaymentStatus);

/**
 * GET /api/payment/bank-info
 * Returns bank account details for the frontend VietQR code builder.
 */
paymentRouter.get('/bank-info', getBankInfo);
