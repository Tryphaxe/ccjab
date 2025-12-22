import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { create } from 'node:domain';

// 📄 GET : liste de toutes les evens
export async function GET() {
  try {
    const evens = await prisma.even.findMany({
      where: { visible: true },
      orderBy: { createdAt: 'desc' },
      include: {
        salle: true,
        agent: true,
      },
    });
    return NextResponse.json(evens);
  } catch (error) {
    console.error('Erreur GET /api/even/visible :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
  }
}