import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(_request, { params }) {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_TICKET_PAYMENT_SIMULATION !== 'true') {
    return NextResponse.json({ error: 'Le paiement simulé est désactivé.' }, { status: 404 });
  }

  const { reference } = await params;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.ticketOrder.findUnique({
        where: { reference },
        include: { items: true },
      });
      if (!order) return { error: 'Commande introuvable.', status: 404 };
      if (order.status === 'PAID') return { reference: order.reference, status: order.status };
      if (order.status !== 'PENDING' || order.expiresAt <= new Date()) {
        return { error: 'Cette réservation a expiré. Recommencez votre commande.', status: 409 };
      }

      for (const item of order.items) {
        await tx.ticket.createMany({
          data: Array.from({ length: item.quantity }, () => ({ orderItemId: item.id })),
        });
      }
      await tx.ticketOrder.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date() },
      });
      return { reference: order.reference, status: 'PAID' };
    }, { isolationLevel: 'Serializable' });

    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result);
  } catch (error) {
    if (error.code === 'P2034') return NextResponse.json({ error: 'La commande a changé. Actualisez puis réessayez.' }, { status: 409 });
    console.error('Erreur de simulation de paiement de billet:', error);
    return NextResponse.json({ error: 'Impossible de simuler le paiement.' }, { status: 500 });
  }
}
