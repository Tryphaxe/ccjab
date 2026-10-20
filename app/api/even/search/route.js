import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';

export async function GET(request) {
  const auth = await authorize(request, ['ADMIN', 'FINANCIER', 'ASSISTANT']);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(searchParams.get('pageSize') || '10', 10) || 10));
  const query = (searchParams.get('q') || '').trim().slice(0, 100);
  const dateStartValue = searchParams.get('dateStart');
  const dateEndValue = searchParams.get('dateEnd');
  const dateStart = dateStartValue ? new Date(`${dateStartValue}T00:00:00`) : null;
  const dateEnd = dateEndValue ? new Date(`${dateEndValue}T23:59:59.999`) : null;
  if ((dateStart && !Number.isFinite(dateStart.getTime())) || (dateEnd && !Number.isFinite(dateEnd.getTime())) || (dateStart && dateEnd && dateStart > dateEnd)) {
    return NextResponse.json({ error: 'La période de recherche est invalide.' }, { status: 400 });
  }

  const now = new Date();
  const status = searchParams.get('status');
  const where = {
    ...(searchParams.get('agent') ? { agent: { name: searchParams.get('agent') } } : {}),
    ...(searchParams.get('type') ? { type: searchParams.get('type') } : {}),
    ...(searchParams.get('category') ? { categorie: searchParams.get('category') } : {}),
    ...(dateStart ? { date_debut: { gte: dateStart } } : {}),
    ...(dateEnd ? { date_fin: { lte: dateEnd } } : {}),
    ...(status === 'A venir' ? { date_debut: { gt: now } } : {}),
    ...(status === 'En cours' ? { date_debut: { lte: now }, date_fin: { gte: now } } : {}),
    ...(status === 'Terminé' ? { date_fin: { lt: now } } : {}),
    ...(query ? { OR: [
      { nom_evenement: { contains: query, mode: 'insensitive' } },
      { nom_client: { contains: query, mode: 'insensitive' } },
      { categorie: { contains: query, mode: 'insensitive' } },
    ] } : {}),
  };

  // Combine date range and status date predicates instead of allowing one to overwrite the other.
  if (status === 'A venir') where.date_debut = { ...(dateStart ? { gte: dateStart } : {}), gt: now };
  if (status === 'En cours') {
    where.date_debut = { ...(dateStart ? { gte: dateStart } : {}), lte: now };
    where.date_fin = { ...(dateEnd ? { lte: dateEnd } : {}), gte: now };
  }
  if (status === 'Terminé') where.date_fin = { ...(dateEnd ? { lte: dateEnd } : {}), lt: now };

  try {
    const [events, total] = await Promise.all([
      prisma.even.findMany({
        where,
        orderBy: [{ date_debut: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          salles: { select: { id: true, nom_salle: true, nombre_place: true } },
          agent: { select: { id: true, name: true } },
          ...(auth.user.role === 'ASSISTANT' ? {} : { payments: { select: { amount: true, paidAt: true, isInitialAdvance: true } } }),
        },
      }),
      prisma.even.count({ where }),
    ]);
    return NextResponse.json({ events, total, page, pageSize, pageCount: Math.ceil(total / pageSize) });
  } catch (error) {
    console.error('Erreur de recherche des événements:', error);
    return NextResponse.json({ error: 'Impossible de récupérer les événements.' }, { status: 500 });
  }
}
