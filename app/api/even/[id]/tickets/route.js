import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';
import { ticketingMaintenanceResponse } from '@/lib/ticketingMaintenance';

export async function GET(request, { params }) {
  return ticketingMaintenanceResponse();
  const auth = await authorize(request, ['ADMIN', 'FINANCIER']);
  if (auth.response) return auth.response;
  const { id: eventId } = await params;

  try {
    const ticketTypes = await prisma.ticketType.findMany({
      where: { eventId },
      include: {
        _count: { select: { items: true } },
        items: {
          where: {
            order: {
              OR: [
                { status: 'PAID' },
                { status: 'PENDING', expiresAt: { gt: new Date() } },
              ],
            },
          },
          select: { quantity: true },
        },
      },
      orderBy: [{ createdAt: 'asc' }],
    });
    return NextResponse.json(ticketTypes.map(({ items, ...type }) => ({
      ...type,
      reserved: items.reduce((sum, item) => sum + item.quantity, 0),
      available: Math.max(0, type.capacity - items.reduce((sum, item) => sum + item.quantity, 0)),
    })));
  } catch (error) {
    console.error('Erreur de lecture des catégories de billets:', error);
    return NextResponse.json({ error: 'Impossible de récupérer la billetterie.' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  return ticketingMaintenanceResponse();
  const auth = await authorize(request, ['ADMIN']);
  if (auth.response) return auth.response;
  const { id: eventId } = await params;

  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, 500) : '';
    const price = Number(body.price);
    const capacity = Number(body.capacity);
    const salesStart = body.salesStart ? new Date(body.salesStart) : null;
    const salesEnd = body.salesEnd ? new Date(body.salesEnd) : null;
    if (!name || !Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(capacity) || capacity < 1) {
      return NextResponse.json({ error: 'Indiquez un nom, un prix entier positif ou nul et une capacité valide.' }, { status: 400 });
    }
    if ((salesStart && !Number.isFinite(salesStart.getTime())) || (salesEnd && !Number.isFinite(salesEnd.getTime())) || (salesStart && salesEnd && salesStart >= salesEnd)) {
      return NextResponse.json({ error: 'La période de vente est invalide.' }, { status: 400 });
    }

    const created = await prisma.$transaction(async (tx) => {
      const event = await tx.even.findUnique({ where: { id: eventId }, select: { id: true, nom_evenement: true, categorie: true } });
      if (!event) return null;
      const type = await tx.ticketType.create({
        data: { eventId, name, description: description || null, price, capacity, salesStart, salesEnd, isActive: body.isActive === true },
      });
      await writeAuditLog({
        actor: auth.user,
        action: 'CREATE',
        entity: 'Tarif de billetterie',
        entityId: type.id,
        summary: `a créé le tarif « ${name} » pour « ${event.nom_evenement || event.categorie} »`,
        metadata: { eventId, price, capacity },
        client: tx,
      });
      return type;
    });

    if (!created) return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Un tarif porte déjà ce nom pour cet événement.' }, { status: 409 });
    console.error('Erreur de création du tarif de billetterie:', error);
    return NextResponse.json({ error: 'Impossible de créer le tarif.' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  return ticketingMaintenanceResponse();
  const auth = await authorize(request, ['ADMIN']);
  if (auth.response) return auth.response;
  const { id: eventId } = await params;

  try {
    const body = await request.json();
    const ticketTypeId = typeof body.id === 'string' ? body.id : '';
    if (!ticketTypeId) return NextResponse.json({ error: 'Tarif introuvable.' }, { status: 400 });

    const current = await prisma.ticketType.findFirst({ where: { id: ticketTypeId, eventId } });
    if (!current) return NextResponse.json({ error: 'Tarif introuvable.' }, { status: 404 });

    const data = {};
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) return NextResponse.json({ error: 'Le nom du tarif est obligatoire.' }, { status: 400 });
      data.name = body.name.trim().slice(0, 80);
    }
    if (body.description !== undefined) data.description = typeof body.description === 'string' ? body.description.trim().slice(0, 500) || null : null;
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isSafeInteger(price) || price < 0) return NextResponse.json({ error: 'Le prix doit être un nombre entier positif ou nul.' }, { status: 400 });
      data.price = price;
    }
    if (body.capacity !== undefined) {
      const capacity = Number(body.capacity);
      if (!Number.isSafeInteger(capacity) || capacity < 1) return NextResponse.json({ error: 'La capacité doit être un entier supérieur à zéro.' }, { status: 400 });
      const reservations = await prisma.ticketOrderItem.aggregate({
        where: { ticketTypeId, order: { OR: [{ status: 'PAID' }, { status: 'PENDING', expiresAt: { gt: new Date() } }] } },
        _sum: { quantity: true },
      });
      if (capacity < (reservations._sum.quantity || 0)) return NextResponse.json({ error: 'La capacité ne peut pas être inférieure aux billets vendus et réservés.' }, { status: 409 });
      data.capacity = capacity;
    }
    if (body.salesStart !== undefined) data.salesStart = body.salesStart ? new Date(body.salesStart) : null;
    if (body.salesEnd !== undefined) data.salesEnd = body.salesEnd ? new Date(body.salesEnd) : null;
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== 'boolean') return NextResponse.json({ error: 'Le statut actif doit être booléen.' }, { status: 400 });
      data.isActive = body.isActive;
    }
    const salesStart = data.salesStart === undefined ? current.salesStart : data.salesStart;
    const salesEnd = data.salesEnd === undefined ? current.salesEnd : data.salesEnd;
    if ((salesStart && !Number.isFinite(salesStart.getTime())) || (salesEnd && !Number.isFinite(salesEnd.getTime())) || (salesStart && salesEnd && salesStart >= salesEnd)) {
      return NextResponse.json({ error: 'La période de vente est invalide.' }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const type = await tx.ticketType.update({ where: { id: ticketTypeId }, data });
      await writeAuditLog({
        actor: auth.user,
        action: 'UPDATE',
        entity: 'Tarif de billetterie',
        entityId: type.id,
        summary: `a modifié le tarif « ${type.name} »`,
        metadata: { eventId, changedFields: Object.keys(data) },
        client: tx,
      });
      return type;
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Un tarif porte déjà ce nom pour cet événement.' }, { status: 409 });
    console.error('Erreur de mise à jour du tarif de billetterie:', error);
    return NextResponse.json({ error: 'Impossible de modifier le tarif.' }, { status: 500 });
  }
}
