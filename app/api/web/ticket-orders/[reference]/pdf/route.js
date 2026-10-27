import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateTicketPdf } from '@/lib/ticketPdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const { reference } = await params;
  try {
    const order = await prisma.ticketOrder.findUnique({
      where: { reference },
      include: {
        event: { select: { nom_evenement: true, categorie: true, description: true, image: true, date_debut: true, date_fin: true, salles: { select: { nom_salle: true } } } },
        items: { include: { ticketType: { select: { name: true } }, tickets: { select: { code: true, status: true } } } },
      },
    });
    if (!order) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    if (order.status !== 'PAID') return NextResponse.json({ error: 'Le téléchargement sera disponible après confirmation du paiement.' }, { status: 409 });

    const pdf = await generateTicketPdf(order);
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="billets-CCJAB-${order.reference}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Erreur de génération du PDF des billets:', error);
    return NextResponse.json({ error: 'Impossible de générer les billets PDF.' }, { status: 500 });
  }
}
