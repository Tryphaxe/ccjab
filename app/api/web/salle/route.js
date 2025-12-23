import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 📄 GET : liste de toutes les salles visibles
export async function GET() {
  try {
    const salles = await prisma.salle.findMany({
      orderBy: { nom_salle: 'asc' },
      where: {visible: true},
      include: { commodites: { include: { commodite: true } } }
    });
    return NextResponse.json(salles);
  } catch (error) {
    console.error('Erreur GET /api/web/salle:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
  }
}