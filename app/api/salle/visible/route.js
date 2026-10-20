import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';

// 📄 GET : liste de toutes les salles
export async function GET(request) {
  const auth = await authorize(request, ['ADMIN', 'AGENT', 'FINANCIER', 'EDITEUR']);
  if (auth.response) return auth.response;
  try {
    const salles = await prisma.salle.findMany({
      orderBy: { nom_salle: 'asc' },
      where: { visible: true },
      include: { commodites: { include: { commodite: true } } }
    });
    return NextResponse.json(salles);
  } catch (error) {
    console.error('Erreur GET /api/salle/visible :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
  }
}
