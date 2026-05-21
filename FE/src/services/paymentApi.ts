const API_BASE = 'http://localhost:5000/api/payment'

export interface PaymentStatus {
  status: 'pending' | 'paid'
  orderId: string
  amount?: number
  paidAt?: string
}

export interface BankInfo {
  bankId: string
  accountNumber: string
  accountName: string
  bankShortName: string
}

/**
 * Poll the backend for the payment status of a given orderId.
 */
export async function checkPaymentStatus(orderId: string): Promise<PaymentStatus> {
  const res = await fetch(`${API_BASE}/status/${orderId}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to check payment status')
  return res.json() as Promise<PaymentStatus>
}

/**
 * Fetch bank account info from the backend (reads from .env / SePay config).
 */
export async function fetchBankInfo(): Promise<BankInfo> {
  const res = await fetch(`${API_BASE}/bank-info`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch bank info')
  return res.json() as Promise<BankInfo>
}

/**
 * Build a VietQR image URL via img.vietqr.io.
 * Returns a fully-formed img src that renders a bank QR code.
 */
export function buildVietQrUrl(bankInfo: BankInfo, amount: number, orderId: string): string {
  const { bankId, accountNumber } = bankInfo
  const addInfo = encodeURIComponent(orderId)
  const accountName = encodeURIComponent(bankInfo.accountName)
  return (
    `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.jpg` +
    `?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`
  )
}
