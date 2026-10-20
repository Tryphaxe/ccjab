import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 📄 GET : liste de toutes les evens visibles
export async function GET() {
    try {
        const evens = await prisma.even.findMany({
            orderBy: { createdAt: 'desc' },
            where: { visible: true },
            select: {
                id: true,
                nom_evenement: true,
                categorie: true,
                date_debut: true,
                date_fin: true,
                visible: true,
                description: true,
                type: true,
                image: true,
                salles: { select: { id: true, nom_salle: true } },
            },
        });
        return NextResponse.json(evens);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
    }
}
