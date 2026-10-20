import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';

export async function GET(request) {
  const auth = await authorize(request, ['ADMIN']);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(10, Number.parseInt(searchParams.get('pageSize') || '25', 10) || 25));
  const action = searchParams.get('action');
  const entity = searchParams.get('entity');
  const query = (searchParams.get('q') || '').trim().slice(0, 120);

  const where = {
    ...(action ? { action } : {}),
    ...(entity ? { entity } : {}),
    ...(query ? { OR: [
      { actorName: { contains: query, mode: 'insensitive' } },
      { actorEmail: { contains: query, mode: 'insensitive' } },
      { summary: { contains: query, mode: 'insensitive' } },
      { entity: { contains: query, mode: 'insensitive' } },
    ] } : {}),
  };

  try {
    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true, actorName: true, actorEmail: true, actorRole: true,
          action: true, entity: true, entityId: true, summary: true,
          metadata: true, createdAt: true,
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({ entries, total, page, pageSize, pageCount: Math.ceil(total / pageSize) });
  } catch (error) {
    console.error('Erreur de lecture du journal d’audit:', error);
    return NextResponse.json({ error: 'Impossible de récupérer le journal d’audit.' }, { status: 500 });
  }
}
