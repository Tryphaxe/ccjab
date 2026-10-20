import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_request, { params }) {
  const { id } = await params;

  try {
    const event = await prisma.even.findFirst({
      where: { id, visible: true },
      select: {
        id: true,
        nom_evenement: true,
        categorie: true,
        type: true,
        date_debut: true,
        date_fin: true,
        description: true,
        image: true,
        visible: true,
        salles: { select: { id: true, nom_salle: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Erreur GET /api/web/even/[id]:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération de l’événement.' }, { status: 500 });
  }
}
