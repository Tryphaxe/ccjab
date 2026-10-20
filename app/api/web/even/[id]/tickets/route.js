import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_request, { params }) {
  const { id } = await params;
  const now = new Date();

  try {
    const event = await prisma.even.findFirst({
      where: { id, visible: true },
      select: { id: true, date_fin: true },
    });
    if (!event || event.date_fin < now) return NextResponse.json({ error: 'Billetterie indisponible pour cet événement.' }, { status: 404 });

    const ticketTypes = await prisma.ticketType.findMany({
      where: {
        eventId: id,
        isActive: true,
        AND: [
          { OR: [{ salesStart: null }, { salesStart: { lte: now } }] },
          { OR: [{ salesEnd: null }, { salesEnd: { gt: now } }] },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        capacity: true,
        salesStart: true,
        salesEnd: true,
      },
      orderBy: [{ price: 'asc' }, { name: 'asc' }],
    });

    const reservations = await prisma.ticketOrderItem.groupBy({
      by: ['ticketTypeId'],
      where: {
        ticketTypeId: { in: ticketTypes.map((type) => type.id) },
        order: {
          OR: [
            { status: 'PAID' },
            { status: 'PENDING', expiresAt: { gt: now } },
          ],
        },
      },
      _sum: { quantity: true },
    });
    const reservedByType = new Map(reservations.map((entry) => [entry.ticketTypeId, entry._sum.quantity || 0]));

    return NextResponse.json({
      ticketTypes: ticketTypes.map((type) => ({
        ...type,
        available: Math.max(0, type.capacity - (reservedByType.get(type.id) || 0)),
      })),
      demoModeAvailable: process.env.NODE_ENV !== 'production' && process.env.ENABLE_TICKET_PAYMENT_SIMULATION === 'true',
    });
  } catch (error) {
    console.error('Erreur de lecture des tarifs de billetterie:', error);
    return NextResponse.json({ error: 'Impossible de récupérer les tarifs.' }, { status: 500 });
  }
}
