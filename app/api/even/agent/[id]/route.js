import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';

export async function GET(req, { params }) {
  const auth = await authorize(req, ['ADMIN', 'FINANCIER', 'AGENT']);
  if (auth.response) return auth.response;
  const { id: agentId } = await params;
  if (auth.user.role === 'AGENT' && auth.user.id !== agentId) {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }

  try {
    const evens = await prisma.even.findMany({
      where: { agent_id: agentId },
      orderBy: { createdAt: 'desc' },
      include: {
        salles: true,
        agent: { select: { id: true, name: true, email: true, contact: true, role: true } },
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
