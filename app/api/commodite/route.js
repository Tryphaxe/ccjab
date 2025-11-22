import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 📄 GET : liste de toutes les commodites
export async function GET() {
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
  try {
    const { nom } = await req.json();

    if (!nom) {
      return NextResponse.json({ error: 'Nom de la commodité requis !' }, { status: 400 });
    }

    const commodite = await prisma.commodite.create({
      data: {
        nom
      },
    });

    return NextResponse.json(commodite, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/commodite:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la commodite.' }, { status: 500 });
  }
}
