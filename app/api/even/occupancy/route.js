import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';

export async function GET(request) {
  const auth = await authorize(request, ['ADMIN', 'FINANCIER']);
  if (auth.response) return auth.response;
  const roomIds = new URL(request.url).searchParams.getAll('roomId').filter(Boolean);
  if (!roomIds.length) return NextResponse.json([]);
  if (roomIds.length > 20 || roomIds.some((id) => id.length > 100)) {
    return NextResponse.json({ error: 'Sélection de salles invalide.' }, { status: 400 });
  }
  try {
    const events = await prisma.even.findMany({
      where: { date_fin: { gte: new Date() }, salles: { some: { id: { in: roomIds } } } },
      select: { id: true, date_debut: true, date_fin: true, salles: { select: { id: true } } },
      orderBy: { date_debut: 'asc' },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Erreur de lecture des disponibilités:', error);
    return NextResponse.json({ error: 'Impossible de vérifier les disponibilités.' }, { status: 500 });
  }
}
