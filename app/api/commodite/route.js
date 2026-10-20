import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

// 📄 GET : liste de toutes les commodites
export async function GET(request) {
  const auth = await authorize(request, ['ADMIN', 'AGENT', 'FINANCIER', 'EDITEUR']);
  if (auth.response) return auth.response;
  try {
    const commodites = await prisma.commodite.findMany({
      orderBy: { nom: 'asc' },
    });
    return NextResponse.json(commodites);
  } catch (error) {
    console.error('Erreur GET /api/commodite:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
  }
}

// ➕ POST : créer une nouvelle commodite
export async function POST(req) {
  const auth = await authorize(req, ['ADMIN']);
  if (auth.response) return auth.response;
  try {
    const { nom } = await req.json();

    if (!nom) {
      return NextResponse.json({ error: 'Nom de la commodité requis !' }, { status: 400 });
    }

    const commodite = await prisma.$transaction(async (tx) => {
    const created = await tx.commodite.create({
      data: {
        nom
      },
    });

    await writeAuditLog({ actor: auth.user, action: 'CREATE', entity: 'Commodité', entityId: created.id, summary: `a créé la commodité « ${created.nom} »`, client: tx });
    return created;
    });

    return NextResponse.json(commodite, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/commodite:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la commodite.' }, { status: 500 });
  }
}
