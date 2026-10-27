import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_request, { params }) {
  const { reference } = await params;
  try {
    const order = await prisma.ticketOrder.findUnique({
      where: { reference },
      select: {
        reference: true,
        status: true,
        totalAmount: true,
        currency: true,
        ticketEmailStatus: true,
        expiresAt: true,
        paidAt: true,
        event: { select: { nom_evenement: true, date_debut: true, date_fin: true } },
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            ticketType: { select: { name: true } },
            tickets: { select: { code: true, status: true, scannedAt: true } },
          },
        },
      },
    });
    if (!order) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    const status = order.status === 'PENDING' && order.expiresAt <= new Date() ? 'EXPIRED' : order.status;
    return NextResponse.json({ ...order, status });
  } catch (error) {
    console.error('Erreur de lecture de commande de billets:', error);
    return NextResponse.json({ error: 'Impossible de récupérer la commande.' }, { status: 500 });
  }
}
