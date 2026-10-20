import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';

// 📄 GET : liste de toutes les evens
export async function GET(request) {
  const auth = await authorize(request, ['ADMIN', 'FINANCIER', 'EDITEUR', 'AGENT']);
  if (auth.response) return auth.response;
  try {
    const evens = await prisma.even.findMany({
      where: auth.user.role === 'AGENT'
        ? { visible: true, agent_id: auth.user.id }
        : { visible: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, nom_evenement: true, categorie: true, date_debut: true,
        date_fin: true, visible: true, description: true, type: true,
        image: true, fiche: true,
        salles: { select: { id: true, nom_salle: true, nombre_place: true } },
        agent: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(evens);
  } catch (error) {
    console.error('Erreur GET /api/even/visible :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
  }
}
