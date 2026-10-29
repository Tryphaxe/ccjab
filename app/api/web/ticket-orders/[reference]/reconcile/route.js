import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getGeniusPayPayment } from '@/lib/geniusPay';
import { deliverTicketEmail } from '@/lib/ticketDelivery';

function responseError(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(_request, { params }) {
  const { reference } = await params;

  try {
    const order = await prisma.ticketOrder.findUnique({
      where: { reference },
      select: {
        id: true,
        status: true,
        paymentProvider: true,
        geniusPayReference: true,
        totalAmount: true,
        currency: true,
      },
    });
    if (!order) return responseError('Commande introuvable.', 404);
    if (order.status !== 'PENDING') return NextResponse.json({ status: order.status });
    if (order.paymentProvider !== 'GENIUSPAY' || !order.geniusPayReference) {
      return NextResponse.json({ status: order.status });
    }

    const payment = await getGeniusPayPayment(order.geniusPayReference);
    if (payment.reference !== order.geniusPayReference) {
      return responseError('La référence de transaction ne correspond pas à la commande.', 409);
    }
    if (payment.environment && process.env.NODE_ENV === 'production' && payment.environment !== 'live') {
      return responseError('La transaction Genius Pay n’est pas en environnement Live.', 409);
    }
    const paymentProvider = String(payment.payment_provider || payment.payment_method || payment.provider || payment.gateway || '').toLowerCase();
    if (paymentProvider !== 'wave') return responseError('La transaction n’a pas été réglée avec Wave.', 409);
    if (Number(payment.amount) !== order.totalAmount || payment.currency !== order.currency) {
      return responseError('Le montant ou la devise de la transaction ne correspond pas à la commande.', 409);
    }
    if (payment.metadata?.order_id !== order.id || (payment.metadata?.order_reference && payment.metadata.order_reference !== reference)) {
      return responseError('Les métadonnées de la transaction ne correspondent pas à cette commande.', 409);
    }
    if (payment.status !== 'completed') {
      return NextResponse.json({ status: order.status, providerStatus: payment.status || 'unknown' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.ticketOrder.findUnique({
        where: { id: order.id },
        include: { items: true },
      });
      if (!current) return { status: 'MISSING' };
      if (current.status === 'PAID' || current.status === 'REFUND_REQUIRED') return { status: current.status };
      if (current.status !== 'PENDING') return { status: current.status };

      let capacityConflict = false;
      for (const item of current.items) {
        const reserved = await tx.ticketOrderItem.aggregate({
          where: {
            ticketTypeId: item.ticketTypeId,
            orderId: { not: current.id },
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
          where: { id: current.id },
          data: { status: 'REFUND_REQUIRED', paymentProvider: 'GENIUSPAY', geniusPayReference: order.geniusPayReference },
        });
        return { status: 'REFUND_REQUIRED' };
      }

      for (const item of current.items) {
        await tx.ticket.createMany({ data: Array.from({ length: item.quantity }, () => ({ orderItemId: item.id })) });
      }
      await tx.ticketOrder.update({
        where: { id: current.id },
        data: {
          status: 'PAID',
          paymentProvider: 'GENIUSPAY',
          geniusPayReference: order.geniusPayReference,
          paidAt: new Date(),
        },
      });
      return { status: 'PAID' };
    }, { isolationLevel: 'Serializable' });

    if (result.status === 'MISSING') return responseError('Commande introuvable.', 404);
    if (result.status === 'PAID') {
      await deliverTicketEmail(order.id).catch((error) => {
        console.error('Paiement vérifié; échec de l’envoi des billets par e-mail:', error);
      });
    }
    return NextResponse.json({ status: result.status, reconciled: result.status === 'PAID' });
  } catch (error) {
    if (error.code === 'P2034') return responseError('Vérification en cours; actualisez le statut dans quelques secondes.', 503);
    console.error('Erreur de vérification Genius Pay:', error);
    return responseError('Impossible de vérifier le paiement auprès de Genius Pay.', 502);
  }
}
