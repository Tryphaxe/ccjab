import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const HOLD_MINUTES = 15;
const MAX_TICKETS_PER_ORDER = 10;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  const simulationEnabled = process.env.NODE_ENV !== 'production' && process.env.ENABLE_TICKET_PAYMENT_SIMULATION === 'true';
  if (!simulationEnabled) {
    return NextResponse.json({ error: 'La réservation en ligne sera disponible dès la connexion du paiement sécurisé.' }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const ticketTypeId = typeof body.ticketTypeId === 'string' ? body.ticketTypeId : '';
  const customerName = typeof body.customerName === 'string' ? body.customerName.trim().slice(0, 120) : '';
  const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim().toLowerCase().slice(0, 254) : '';
  const customerPhone = typeof body.customerPhone === 'string' ? body.customerPhone.trim().slice(0, 40) : '';
  const quantity = Number(body.quantity);

  if (!ticketTypeId || !customerName || !emailPattern.test(customerEmail) || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_TICKETS_PER_ORDER) {
    return NextResponse.json({ error: 'Vérifiez vos coordonnées et choisissez entre 1 et 10 billets.' }, { status: 400 });
  }

  const now = new Date();
  try {
    const order = await prisma.$transaction(async (tx) => {
      const ticketType = await tx.ticketType.findUnique({
        where: { id: ticketTypeId },
        include: { event: { select: { id: true, visible: true, date_fin: true } } },
      });
      if (!ticketType || !ticketType.isActive || !ticketType.event.visible || ticketType.event.date_fin < now) {
        const error = new Error('Ce tarif n’est pas disponible à la vente.');
        error.code = 'TICKET_TYPE_UNAVAILABLE';
        throw error;
      }
      if ((ticketType.salesStart && ticketType.salesStart > now) || (ticketType.salesEnd && ticketType.salesEnd <= now)) {
        const error = new Error('La période de vente de ce tarif est terminée ou n’a pas encore commencé.');
        error.code = 'TICKET_SALES_CLOSED';
        throw error;
      }

      const reserved = await tx.ticketOrderItem.aggregate({
        where: {
          ticketTypeId,
          order: { OR: [{ status: 'PAID' }, { status: 'PENDING', expiresAt: { gt: now } }] },
        },
        _sum: { quantity: true },
      });
      const remaining = ticketType.capacity - (reserved._sum.quantity || 0);
      if (quantity > remaining) {
        const error = new Error(`Il ne reste que ${Math.max(0, remaining)} billet(s) à ce tarif.`);
        error.code = 'TICKET_CAPACITY';
        throw error;
      }

      const totalAmount = ticketType.price * quantity;
      if (!Number.isSafeInteger(totalAmount)) {
        const error = new Error('Le montant de cette commande est invalide.');
        error.code = 'INVALID_TICKET_AMOUNT';
        throw error;
      }

      return tx.ticketOrder.create({
        data: {
          eventId: ticketType.eventId,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          totalAmount,
          expiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000),
          items: { create: { ticketTypeId, quantity, unitPrice: ticketType.price } },
        },
        select: { id: true, reference: true, status: true, totalAmount: true, currency: true, expiresAt: true },
      });
    }, { isolationLevel: 'Serializable' });

    return NextResponse.json({ ...order, holdMinutes: HOLD_MINUTES }, { status: 201 });
  } catch (error) {
    if (['TICKET_TYPE_UNAVAILABLE', 'TICKET_SALES_CLOSED', 'TICKET_CAPACITY', 'INVALID_TICKET_AMOUNT'].includes(error.code)) {
      return NextResponse.json({ error: error.message }, { status: error.code === 'TICKET_CAPACITY' ? 409 : 400 });
    }
    if (error.code === 'P2034') return NextResponse.json({ error: 'Les dernières places sont en cours de réservation. Réessayez.' }, { status: 409 });
    console.error('Erreur de création de commande de billets:', error);
    return NextResponse.json({ error: 'Impossible de créer la commande.' }, { status: 500 });
  }
}
