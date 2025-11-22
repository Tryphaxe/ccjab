import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 📄 GET : liste de toutes les salles
export async function GET() {
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
  try {
    const { nom_salle, nombre_place, commodites } = await req.json();

    if (!nom_salle) {
      return NextResponse.json({ error: 'Nom de la salle requis !' }, { status: 400 });
    }

    const salle = await prisma.salle.create({
      data: {
        nom_salle,
        nombre_place: parseInt(nombre_place) || 0,
        commodites: {
          create: commodites.map((id) => ({
            commodite: { connect: { id } },
          })),
        },
      },
    });

  return NextResponse.json(salle, { status: 201 });
} catch (error) {
  console.error('Erreur POST /api/salle:', error);
  return NextResponse.json({ error: 'Erreur lors de la création de la salle.' }, { status: 500 });
}
}