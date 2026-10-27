import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';

export async function GET(request) {
  const auth = await authorize(request, ['ADMIN', 'FINANCIER']);
  if (auth.response) return auth.response;

  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(params.get('pageSize') || '25', 10) || 25));
  const search = (params.get('search') || '').trim().slice(0, 100);
  const where = {
    status: 'PAID',
    paymentProvider: { in: ['WAVE', 'GENIUSPAY'] },
    ...(search ? {
      OR: [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { event: { is: { nom_evenement: { contains: search, mode: 'insensitive' } } } },
      ],
    } : {}),
  };

  try {
    const [orders, total] = await Promise.all([
      prisma.ticketOrder.findMany({
        where,
        orderBy: [{ paidAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          reference: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          paymentProvider: true,
          totalAmount: true,
          currency: true,
          paidAt: true,
          event: { select: { nom_evenement: true, categorie: true } },
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              ticketType: { select: { name: true } },
            },
          },
        },
      }),
      prisma.ticketOrder.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pageInfo: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Erreur de lecture des acheteurs de billets:', error);
    return NextResponse.json({ error: 'Impossible de charger la liste des acheteurs.' }, { status: 500 });
  }
}
