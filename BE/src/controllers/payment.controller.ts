import { Request, Response } from 'express';
import { env } from '../config/env';
import User from '../models/user.model';

// ---------------------------------------------------------------------------
// In-memory stores.
// ---------------------------------------------------------------------------

interface PaymentRecord {
  status: 'pending' | 'paid';
  amount: number;
  paidAt?: string;
}

interface OrderRegistration {
  userId: string;
  turnsToAdd: number;
}

/** Maps orderId → payment status (polled by the frontend) */
const paymentStore = new Map<string, PaymentRecord>();

/** Maps orderId → user registration data (set when user opens payment modal) */
const orderRegistrations = new Map<string, OrderRegistration>();

/** Idempotency guard – prevents double-processing the same SePay transaction */
const processedTransactionIds = new Set<number>();

// ---------------------------------------------------------------------------
// POST /api/payment/register-order
// Called by the frontend when the user opens a subscription payment modal.
// Associates a SUB order ID with the authenticated user so the webhook can
// credit aiTurns after payment is confirmed.
// ---------------------------------------------------------------------------
export async function registerOrder(req: Request, res: Response): Promise<void> {
  const { orderId, userId, turnsToAdd } = req.body as {
    orderId?: string;
    userId?: string;
    turnsToAdd?: number;
  };

  if (!orderId || !userId || typeof turnsToAdd !== 'number') {
    res.status(400).json({ success: false, message: 'orderId, userId, and turnsToAdd are required' });
    return;
  }

  if (!orderId.startsWith('SUB')) {
    res.status(400).json({ success: false, message: 'Only SUB orders are accepted' });
    return;
  }

  orderRegistrations.set(orderId.toUpperCase(), { userId, turnsToAdd });
  paymentStore.set(orderId.toUpperCase(), { status: 'pending', amount: 0 });

  console.log(`[Payment] Registered order ${orderId} for user ${userId} (+${turnsToAdd} turns)`);
  res.status(200).json({ success: true });
}

// ---------------------------------------------------------------------------
// POST /api/payment/webhook
// Called by SePay when a bank transfer is detected.
// Only handles SUB (subscription) orders. On success, increments aiTurns
// for the registered user in MongoDB.
// ---------------------------------------------------------------------------
export async function sePayWebhook(req: Request, res: Response): Promise<void> {
  // 1. Authenticate the request with API Key
  const authHeader = req.headers['authorization'] ?? '';
  const expectedKey = `Apikey ${env.SEPAY_WEBHOOK_API_KEY}`;

  if (env.SEPAY_WEBHOOK_API_KEY && authHeader !== expectedKey) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const payload = req.body as {
    id?: number;
    content?: string;
    transferAmount?: number;
    transferType?: string;
    transactionDate?: string;
    gateway?: string;
    accountNumber?: string;
    referenceCode?: string;
  };

  // 2. Only process incoming transfers
  if (payload.transferType !== 'in') {
    res.status(200).json({ success: true, message: 'Ignored outgoing transfer' });
    return;
  }

  // 3. Idempotency – skip duplicate webhook calls
  if (payload.id && processedTransactionIds.has(payload.id)) {
    res.status(200).json({ success: true, message: 'Duplicate – already processed' });
    return;
  }

  // 4. Extract orderId — only accept SUB<timestamp> subscription orders.
  //    (LVX prefix is treated as an alias for SUB for backwards compatibility.)
  const content = payload.content ?? '';
  const orderIdMatch = content.match(/(SUB|LVX)\d+/i);
  const orderId = orderIdMatch ? orderIdMatch[0].toUpperCase() : null;

  if (!orderId) {
    // Not a recognised Livaxis subscription order — acknowledge so SePay doesn't retry
    res.status(200).json({ success: true, message: 'Not a Livaxis subscription order' });
    return;
  }

  // 5. Mark the order as paid in the in-memory store
  paymentStore.set(orderId, {
    status: 'paid',
    amount: payload.transferAmount ?? 0,
    paidAt: payload.transactionDate ?? new Date().toISOString(),
  });

  if (payload.id) processedTransactionIds.add(payload.id);

  console.log(`[SePay] Subscription order ${orderId} marked as PAID – amount: ${payload.transferAmount ?? 0}`);

  // 6. handleSubscriptionPayment – look up user and increment aiTurns
  const registration = orderRegistrations.get(orderId);

  if (registration) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        registration.userId,
        { $inc: { aiTurns: registration.turnsToAdd } },
        { new: true },
      );

      if (updatedUser) {
        console.log(
          `[SePay] +${registration.turnsToAdd} aiTurns granted to user ${registration.userId}. ` +
          `New balance: ${updatedUser.aiTurns}`,
        );
      } else {
        console.warn(`[SePay] User ${registration.userId} not found – turns not credited.`);
      }

      // Clean up the registration after processing
      orderRegistrations.delete(orderId);
    } catch (err) {
      console.error(`[SePay] Failed to update aiTurns for user ${registration.userId}:`, err);
      // Do NOT return an error to SePay – we already marked as paid.
      // A retry mechanism or admin intervention would be needed for production.
    }
  } else {
    console.warn(`[SePay] No registration found for order ${orderId}. aiTurns not credited.`);
  }

  res.status(200).json({ success: true });
}

// ---------------------------------------------------------------------------
// GET /api/payment/status/:orderId
// Polled by the frontend every 3 seconds.
// ---------------------------------------------------------------------------
export function getPaymentStatus(req: Request, res: Response): void {
  const orderId = String(req.params['orderId'] ?? '').toUpperCase();

  const record = paymentStore.get(orderId);

  if (!record) {
    // Create a pending entry so we have a record (first poll call)
    paymentStore.set(orderId, { status: 'pending', amount: 0 });
    res.status(200).json({ status: 'pending', orderId });
    return;
  }

  res.status(200).json({
    status: record.status,
    orderId,
    amount: record.amount,
    paidAt: record.paidAt,
  });
}

// ---------------------------------------------------------------------------
// GET /api/payment/bank-info
// Returns bank configuration for the frontend QR code builder.
// ---------------------------------------------------------------------------
export function getBankInfo(_req: Request, res: Response): void {
  res.status(200).json({
    bankId: env.BANK_ID,
    accountNumber: env.BANK_ACCOUNT_NUMBER,
    accountName: env.BANK_ACCOUNT_NAME,
    bankShortName: env.BANK_SHORT_NAME,
  });
}
