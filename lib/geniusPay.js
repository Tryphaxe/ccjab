import { createHmac, timingSafeEqual } from 'node:crypto';

const API_URL = 'https://geniuspay.ci/api/v1/merchant/payments';
const isWaveHost = (hostname) => hostname === 'wave.com' || hostname.endsWith('.wave.com');

export function geniusPayConfigured() {
  return Boolean(process.env.GENIUSPAY_API_KEY && process.env.GENIUSPAY_API_SECRET && process.env.GENIUSPAY_WEBHOOK_SECRET && process.env.APP_URL);
}

export async function createGeniusPayCheckout({ order, customer }) {
  if (!geniusPayConfigured()) throw new Error('Le paiement Genius Pay n’est pas configuré.');

  const baseUrl = new URL(process.env.APP_URL);
  if (process.env.NODE_ENV === 'production' && baseUrl.protocol !== 'https:') {
    throw new Error('APP_URL doit utiliser HTTPS en production.');
  }
  const returnUrl = new URL('/web/paiement/retour', baseUrl);
  returnUrl.searchParams.set('reference', order.reference);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.GENIUSPAY_API_KEY,
      'X-API-Secret': process.env.GENIUSPAY_API_SECRET,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: order.totalAmount,
      currency: order.currency,
      payment_method: 'wave',
      description: `Billets CCJAB - ${order.reference}`,
      customer: {
        name: customer.name,
        email: customer.email,
        ...(customer.phone ? { phone: customer.phone } : {}),
        country: 'CI',
      },
      success_url: returnUrl.toString(),
      error_url: returnUrl.toString(),
      metadata: { order_id: order.id, order_reference: order.reference },
    }),
    signal: AbortSignal.timeout(15000),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);
  const payment = payload?.data;
  const paymentUrl = payment?.payment_url;
  let parsedCheckoutUrl;
  try {
    parsedCheckoutUrl = new URL(paymentUrl);
  } catch {
    parsedCheckoutUrl = null;
  }
  const gateway = String(payment?.gateway || payment?.payment_method || payment?.provider || '').toLowerCase();
  if (!response.ok || payload?.success !== true || !payment?.reference || gateway !== 'wave' || !parsedCheckoutUrl || parsedCheckoutUrl.protocol !== 'https:' || !isWaveHost(parsedCheckoutUrl.hostname)) {
    throw new Error('Genius Pay n’a pas retourné de lien Wave valide.');
  }

  const amount = Number(payment.amount);
  if (amount !== order.totalAmount || (payment.currency && payment.currency !== order.currency)) {
    throw new Error('Le montant retourné par Genius Pay ne correspond pas à la commande.');
  }

  return {
    reference: String(payment.reference),
    checkoutUrl: parsedCheckoutUrl.toString(),
    expiresAt: payment.expires_at ? new Date(payment.expires_at) : null,
  };
}

export async function getGeniusPayPayment(reference) {
  if (!process.env.GENIUSPAY_API_KEY || !process.env.GENIUSPAY_API_SECRET) {
    throw new Error('La vérification Genius Pay n’est pas configurée.');
  }

  const response = await fetch(`${API_URL}/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: {
      'X-API-Key': process.env.GENIUSPAY_API_KEY,
      'X-API-Secret': process.env.GENIUSPAY_API_SECRET,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success !== true || !payload?.data) {
    throw new Error(`Impossible de vérifier la transaction Genius Pay (HTTP ${response.status}).`);
  }
  return payload.data;
}

export function verifyGeniusPayWebhook(rawBody, signature, timestamp) {
  const secret = process.env.GENIUSPAY_WEBHOOK_SECRET;
  const timestampNumber = Number(timestamp);
  if (!secret || !signature || !Number.isInteger(timestampNumber) || Math.abs(Date.now() / 1000 - timestampNumber) > 300) return false;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest();
  let received;
  try {
    received = Buffer.from(signature, 'hex');
  } catch {
    return false;
  }
  return received.length === expected.length && timingSafeEqual(received, expected);
}
