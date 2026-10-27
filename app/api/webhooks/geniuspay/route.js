import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyGeniusPayWebhook } from '@/lib/geniusPay';
import { deliverTicketEmail } from '@/lib/ticketDelivery';

function invalid(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-webhook-signature') || '';
  const timestamp = request.headers.get('x-webhook-timestamp') || '';
  if (!verifyGeniusPayWebhook(rawBody, signature, timestamp)) return invalid('Signature de webhook invalide.', 401);

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return invalid('Payload JSON invalide.');
  }
  if (typeof event?.id !== 'string' || typeof event?.event !== 'string' || !event.data || typeof event.data !== 'object') {
    return invalid('Payload de webhook incomplet.');
  }

  const incomingEnvironment = request.headers.get('x-webhook-environment') || event.environment;
  if (process.env.NODE_ENV === 'production' && incomingEnvironment !== 'live') {
    return invalid('Un webhook sandbox ne peut pas modifier une commande de production.', 403);
  }

  const payment = event.data;
  const metadata = payment.metadata || {};
  const orderId = typeof metadata.order_id === 'string' ? metadata.order_id : '';
  const providerReference = typeof payment.reference === 'string' ? payment.reference : '';
  if (!providerReference) return invalid('Référence de paiement absente.');

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.geniusPayWebhookEvent.create({ data: { id: event.id, event: event.event } });

      const order = await tx.ticketOrder.findFirst({
        where: orderId ? { id: orderId } : { geniusPayReference: providerReference },
        include: { items: true },
      });
      if (!order) throw Object.assign(new Error('Commande introuvable.'), { code: 'ORDER_NOT_FOUND' });
      if (order.paymentProvider !== 'GENIUSPAY' && order.paymentProvider !== 'NONE') {
        throw Object.assign(new Error('Fournisseur de paiement inattendu.'), { code: 'PAYMENT_PROVIDER_MISMATCH' });
      }
      if (order.geniusPayReference && order.geniusPayReference !== providerReference) {
        throw Object.assign(new Error('Référence Genius Pay différente de la commande.'), { code: 'PAYMENT_REFERENCE_MISMATCH' });
      }

      if (event.event === 'payment.success') {
        const amount = Number(payment.amount);
        if (payment.status !== 'completed' || amount !== order.totalAmount || payment.currency !== order.currency) {
          throw Object.assign(new Error('Montant, devise ou statut de paiement incohérent.'), { code: 'PAYMENT_DETAILS_MISMATCH' });
        }
        if (order.status !== 'PAID') {
          if (order.status !== 'PENDING') throw Object.assign(new Error('La commande n’est plus en attente.'), { code: 'ORDER_NOT_PENDING' });
          let capacityConflict = false;
          for (const item of order.items) {
            const reserved = await tx.ticketOrderItem.aggregate({
              where: {
                ticketTypeId: item.ticketTypeId,
                orderId: { not: order.id },
                order: { OR: [{ status: 'PAID' }, { status: 'PENDING', expiresAt: { gt: new Date() } }] },
              },
              _sum: { quantity: true },
            });
            const ticketType = await tx.ticketType.findUnique({ where: { id: item.ticketTypeId }, select: { capacity: true } });
            if (!ticketType || (reserved._sum.quantity || 0) + item.quantity > ticketType.capacity) {
              capacityConflict = true;
              break;
            }
          }
          if (capacityConflict) {
            await tx.ticketOrder.update({
              where: { id: order.id },
              data: { status: 'REFUND_REQUIRED', paymentProvider: 'GENIUSPAY', geniusPayReference: providerReference },
            });
          } else {
            for (const item of order.items) {
              await tx.ticket.createMany({ data: Array.from({ length: item.quantity }, () => ({ orderItemId: item.id })) });
            }
            await tx.ticketOrder.update({
              where: { id: order.id },
              data: {
                status: 'PAID',
                paymentProvider: 'GENIUSPAY',
                geniusPayReference: providerReference,
                paidAt: new Date(),
              },
            });
          }
        }
      } else if (event.event === 'payment.refunded') {
        await tx.ticketOrder.update({
          where: { id: order.id },
          data: { status: 'REFUNDED', paymentProvider: 'GENIUSPAY', geniusPayReference: providerReference },
        });
        await tx.ticket.updateMany({
          where: { orderItem: { orderId: order.id } },
          data: { status: 'VOID' },
        });
      } else if (['payment.failed', 'payment.cancelled', 'payment.expired'].includes(event.event) && order.status === 'PENDING') {
        await tx.ticketOrder.update({
          where: { id: order.id },
          data: {
            status: event.event === 'payment.expired' ? 'EXPIRED' : 'CANCELLED',
            paymentProvider: 'GENIUSPAY',
            geniusPayReference: providerReference,
            expiresAt: new Date(),
          },
        });
      }

      await tx.geniusPayWebhookEvent.update({ where: { id: event.id }, data: { processedAt: new Date() } });
      const finalStatus = await tx.ticketOrder.findUnique({ where: { id: order.id }, select: { status: true } });
      return {
        orderId: order.id,
        needsReview: event.event === 'payment.success' && finalStatus?.status === 'REFUND_REQUIRED',
        paid: finalStatus?.status === 'PAID',
      };
    }, { isolationLevel: 'Serializable' });
    if (result.needsReview) console.error('Paiement Genius Pay reçu sans capacité disponible; remboursement requis:', event.id);
    if (event.event === 'payment.success' && result.paid) await deliverTicketEmail(result.orderId);
    return NextResponse.json({ received: true, ...(result.needsReview ? { needsReview: true } : {}) });
  } catch (error) {
    if (error.code === 'P2002') {
      if (event.event === 'payment.success') {
        try {
          const order = orderId
            ? await prisma.ticketOrder.findUnique({ where: { id: orderId }, select: { id: true } })
            : await prisma.ticketOrder.findFirst({ where: { geniusPayReference: providerReference }, select: { id: true } });
          if (order) await deliverTicketEmail(order.id);
        } catch (deliveryError) {
          console.error('Échec de l’envoi des billets après confirmation du paiement:', deliveryError);
          return invalid('Paiement confirmé, mais l’envoi des billets a échoué. Genius Pay pourra réessayer.', 500);
        }
      }
      return NextResponse.json({ received: true, duplicate: true });
    }
    if (error.code === 'P2034') return invalid('Traitement temporairement indisponible.', 503);
    if (error.code === 'ORDER_NOT_FOUND') return invalid(error.message, 404);
    if (error.code === 'PAYMENT_PROVIDER_MISMATCH' || error.code === 'PAYMENT_REFERENCE_MISMATCH' || error.code === 'PAYMENT_DETAILS_MISMATCH' || error.code === 'ORDER_NOT_PENDING') {
      console.error('Webhook Genius Pay rejeté:', error);
      return invalid('Le paiement ne correspond pas à une commande valide.', 409);
    }
    console.error('Erreur de traitement du webhook Genius Pay:', error);
    return invalid('Impossible de traiter le webhook.', 500);
  }
}
