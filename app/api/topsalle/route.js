import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const salles = await prisma.salle.findMany({
            select: {
                nom_salle: true,
                _count: {
                    select: { events: true } // Compte les évènements dans la table de liaison
                }
            }
        });

        // On formate les données pour le graphique (Donut Chart)
        const topSalles = salles
            .filter(salle => salle._count.events > 0) // On ignore les salles jamais utilisées
            .map(salle => ({
                name: salle.nom_salle,
                value: salle._count.events
            }))
            .sort((a, b) => b.value - a.value) // Tri de la plus utilisée à la moins utilisée
            .slice(0, 5); // Optionnel : On ne garde que le Top 5 pour ne pas surcharger le graphique

        return NextResponse.json(topSalles);
        
    } catch (error) {
        console.error("Erreur API TopSalles :", error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des statistiques.' }, { status: 500 });
    }
}