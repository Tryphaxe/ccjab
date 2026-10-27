import prisma from '@/lib/prisma';
import { generateTicketPdf } from '@/lib/ticketPdf';
import { sendTicketEmail } from '@/lib/mail';

export async function deliverTicketEmail(orderId) {
  const now = new Date();
  const staleClaimBefore = new Date(now.getTime() - 5 * 60_000);
  const claim = await prisma.ticketOrder.updateMany({
    where: {
      id: orderId,
      status: 'PAID',
      OR: [
        { ticketEmailStatus: 'PENDING' },
        { ticketEmailStatus: 'SENDING', updatedAt: { lt: staleClaimBefore } },
      ],
    },
    data: { ticketEmailStatus: 'SENDING' },
  });
  if (claim.count === 0) {
    const delivery = await prisma.ticketOrder.findUnique({
      where: { id: orderId },
      select: { status: true, ticketEmailStatus: true },
    });
    if (!delivery || delivery.status !== 'PAID' || delivery.ticketEmailStatus === 'SENT') return false;
    throw new Error('L’envoi des billets est déjà en cours; Genius Pay doit réessayer plus tard.');
  }

  try {
    const order = await prisma.ticketOrder.findUnique({
      where: { id: orderId },
      include: {
        event: { select: { nom_evenement: true, categorie: true, description: true, image: true, date_debut: true, date_fin: true, salles: { select: { nom_salle: true } } } },
        items: { include: { ticketType: { select: { name: true } }, tickets: { select: { code: true, status: true } } } },
      },
    });
    if (!order || order.status !== 'PAID' || !order.items.some((item) => item.tickets.length)) {
      throw new Error('La commande payée ne contient aucun billet à envoyer.');
    }

    const pdf = await generateTicketPdf(order);
    await sendTicketEmail(order, pdf);
    await prisma.ticketOrder.updateMany({
      where: { id: orderId, ticketEmailStatus: 'SENDING' },
      data: { ticketEmailStatus: 'SENT', ticketEmailSentAt: new Date() },
    });
    return true;
  } catch (error) {
    await prisma.ticketOrder.updateMany({
      where: { id: orderId, ticketEmailStatus: 'SENDING' },
      data: { ticketEmailStatus: 'PENDING' },
    }).catch((resetError) => console.error('Impossible de réinitialiser l’envoi des billets:', resetError));
    throw error;
  }
}
