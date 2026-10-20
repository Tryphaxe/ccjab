import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

// 📄 GET : liste de toutes les salles
export async function GET(request) {
  const auth = await authorize(request, ['ADMIN', 'AGENT', 'FINANCIER', 'EDITEUR']);
  if (auth.response) return auth.response;
  try {
    const salles = await prisma.salle.findMany({
      orderBy: { nom_salle: 'asc' },
      include: { commodites: { include: { commodite: true } } }
    });
    return NextResponse.json(salles);
  } catch (error) {
    console.error('Erreur GET /api/salle:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
  }
}

// ➕ POST : créer une nouvelle salle
export async function POST(req) {
  const auth = await authorize(req, ['ADMIN']);
  if (auth.response) return auth.response;
  try {
    const { nom_salle, nombre_place, commodites,image } = await req.json();

    if (!nom_salle) {
      return NextResponse.json({ error: 'Nom de la salle requis !' }, { status: 400 });
    }

    const salle = await prisma.$transaction(async (tx) => {
    const created = await tx.salle.create({
      data: {
        nom_salle,
        nombre_place: parseInt(nombre_place) || 0,
        commodites: {
          create: commodites.map((id) => ({
            commodite: { connect: { id } },
          })),
        },
        image
      },
    });

    await writeAuditLog({ actor: auth.user, action: 'CREATE', entity: 'Salle', entityId: created.id, summary: `a créé la salle « ${created.nom_salle} »`, client: tx });
    return created;
    });

  return NextResponse.json(salle, { status: 201 });
} catch (error) {
  console.error('Erreur POST /api/salle:', error);
  return NextResponse.json({ error: 'Erreur lors de la création de la salle.' }, { status: 500 });
}
}
