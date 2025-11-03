import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req, { params }) {
  const { id: agentId } = await params;

  try {
    const evens = await prisma.even.findMany({
      where: { agent_id: agentId },
      orderBy: { createdAt: 'desc' },
      include: {
        salle: true,
        agent: true,
      },
    });

    return NextResponse.json(evens);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération.' },
      { status: 500 }
    );
  }
}
