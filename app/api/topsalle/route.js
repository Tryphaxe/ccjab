import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 📄 GET : liste de toutes les salles
export async function GET() {
  try {
    const stats = await prisma.even.groupBy({
        by: ['salle_id'],
        _count: {
            id: true,
        },
        orderBy: {
            _count: {
                id: 'desc',
            },
        },
        take: 8, // Top 8
    })

    // 2. Récupérer le total pour les %
    const totalEvents = await prisma.even.count();

    // 3. Formater les données pour le composant
    const formattedStats = await Promise.all(
        stats.map(async (stat) => {
            if (!stat.salle_id) return null;

            const salle = await prisma.salle.findUnique({
                where: { id: stat.salle_id },
                select: { nom_salle: true }
            });

            const count = stat._count.id;
            // Calcul du pourcentage (évite la division par zéro)
            const percentage = totalEvents > 0
                ? Math.round((count / totalEvents) * 100)
                : 0;

            return {
                name: salle?.nom_salle || "Salle Inconnue",
                count: count,
                percentage: percentage
            };
        })
    );

    const salles = formattedStats.filter((s) => s !== null);
    return NextResponse.json(salles);
  } catch (error) {
    console.error('Erreur GET /api/topsalle:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
  }
}