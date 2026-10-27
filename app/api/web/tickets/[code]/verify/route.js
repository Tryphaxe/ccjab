import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const { code } = await params;
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { code },
      select: {
        code: true,
        status: true,
        createdAt: true,
        scannedAt: true,
        orderItem: {
          select: {
            ticketType: { select: { name: true } },
            order: {
              select: {
                status: true,
                customerName: true,
                reference: true,
                event: { select: { nom_evenement: true, categorie: true, date_debut: true, date_fin: true, salles: { select: { nom_salle: true } } } },
              },
            },
          },
        },
      },
    });

    if (!ticket) return NextResponse.json({ valid: false, ticketStatus: 'NOT_FOUND' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });

    const { order, ticketType } = ticket.orderItem;
    const valid = order.status === 'PAID' && ticket.status === 'VALID';
    return NextResponse.json({
      valid,
      ticketStatus: ticket.status,
      scannedAt: ticket.scannedAt,
      orderStatus: order.status,
      code: ticket.code,
      customerName: order.customerName,
      ticketType: ticketType.name,
      event: {
        name: order.event.nom_evenement || order.event.categorie || 'Événement CCJAB',
        dateStart: order.event.date_debut,
        dateEnd: order.event.date_fin,
        locations: order.event.salles.map((room) => room.nom_salle).filter(Boolean),
      },
      orderReference: order.reference,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Erreur de vérification d’un billet:', error);
    return NextResponse.json({ error: 'Impossible de vérifier ce billet.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(request, { params }) {
  const auth = await authorize(request, ['ADMIN', 'AGENT', 'ASSISTANT']);
  if (auth.response) return auth.response;
  const { code } = await params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findUnique({
        where: { code },
        select: {
          id: true,
          code: true,
          status: true,
          scannedAt: true,
          orderItem: {
            select: {
              ticketType: { select: { name: true } },
              order: {
                select: {
                  id: true,
                  status: true,
                  customerName: true,
                  event: { select: { id: true, nom_evenement: true, categorie: true } },
                },
              },
            },
          },
        },
      });

      if (!ticket) return { error: 'Billet introuvable.', status: 404 };
      if (ticket.orderItem.order.status !== 'PAID') return { error: 'Ce billet ne correspond pas à une commande payée.', status: 409 };
      if (ticket.status === 'SCANNED' || ticket.scannedAt) {
        return { error: 'Ce billet a déjà été utilisé.', status: 409, scannedAt: ticket.scannedAt };
      }
      if (ticket.status !== 'VALID') return { error: 'Ce billet a été invalidé.', status: 409 };

      const scannedAt = new Date();
      const updated = await tx.ticket.updateMany({
        where: { id: ticket.id, status: 'VALID', scannedAt: null },
        data: { status: 'SCANNED', scannedAt },
      });
      if (updated.count !== 1) {
        const latest = await tx.ticket.findUnique({ where: { id: ticket.id }, select: { scannedAt: true } });
        return { error: 'Ce billet a déjà été utilisé.', status: 409, scannedAt: latest?.scannedAt || null };
      }

      await writeAuditLog({
        actor: auth.user,
        action: 'SCAN',
        entity: 'Billet',
        entityId: ticket.id,
        summary: `a validé l’entrée de ${ticket.orderItem.order.customerName} pour « ${ticket.orderItem.order.event.nom_evenement || ticket.orderItem.order.event.categorie} »`,
        metadata: { eventId: ticket.orderItem.order.event.id, ticketType: ticket.orderItem.ticketType.name },
        client: tx,
      });

      return { scannedAt, scannedBy: auth.user.name };
    }, { isolationLevel: 'Serializable' });

    if (result.error) return NextResponse.json(result, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
    return NextResponse.json({ success: true, ticketStatus: 'SCANNED', scannedAt: result.scannedAt, scannedBy: result.scannedBy }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error.code === 'P2034') return NextResponse.json({ error: 'Une autre validation est en cours. Rescannez ce billet.' }, { status: 409 });
    console.error('Erreur de validation d’entrée par billet:', error);
    return NextResponse.json({ error: 'Impossible de valider l’entrée.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
