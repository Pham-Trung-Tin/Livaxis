import { Request, Response } from 'express';
import { env } from '../config/env';

// ---------------------------------------------------------------------------
// In-memory payment status store.
// Key: orderId (e.g. "LVX1716201600123")
// Value: { status: 'pending' | 'paid', amount: number, paidAt?: string }
// ---------------------------------------------------------------------------
interface PaymentRecord {
  status: 'pending' | 'paid';
  amount: number;
  paidAt?: string;
}

const paymentStore = new Map<string, PaymentRecord>();
const processedTransactionIds = new Set<number>(); // idempotency guard

// ---------------------------------------------------------------------------
// POST /api/payment/webhook
// Called by SePay when a bank transfer is detected.
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

  // 4. Extract orderId from transfer content.
  //    Our orders use the prefix "LVX" so we match e.g. "LVX1716201600123"
  const content = payload.content ?? '';
  const orderIdMatch = content.match(/LVX\d+/i);
  const orderId = orderIdMatch ? orderIdMatch[0].toUpperCase() : null;

  if (!orderId) {
    // Not a Livaxis order – acknowledge so SePay doesn't retry
    res.status(200).json({ success: true, message: 'Not a Livaxis order' });
    return;
  }

  // 5. Mark the order as paid
  paymentStore.set(orderId, {
    status: 'paid',
    amount: payload.transferAmount ?? 0,
    paidAt: payload.transactionDate ?? new Date().toISOString(),
  });

  if (payload.id) processedTransactionIds.add(payload.id);

  console.log(`[SePay] Order ${orderId} marked as PAID – amount: ${payload.transferAmount ?? 0}`);

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
