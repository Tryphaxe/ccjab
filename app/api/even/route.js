import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 📄 GET : liste de toutes les evens
export async function GET() {
    try {
        const evens = await prisma.even.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                salle: true,
                agent: true,
            },
        });
        return NextResponse.json(evens);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
    }
}

// ➕ POST : créer une nouvelle even
export async function POST(req) {
    try {
        const { categorie, montant, avance, date_debut, date_fin, description, nom_client, contact_client, type, salle_id, agent_id } = await req.json();

        // Vérification simple avant insertion
        if (!nom_client || !categorie || !salle_id || !agent_id || !type || !montant || !date_debut || !date_fin) {
            return NextResponse.json(
                { error: "Certains champs obligatoires sont manquants." },
                { status: 400 }
            );
        }

        // Conversion en Date
        const newStart = new Date(date_debut);
        const newEnd = new Date(date_fin);

        // vérifier avant create
        const conflict = await prisma.even.findFirst({
            where: {
                salle_id,
                AND: [
                    { date_debut: { lt: newEnd } },
                    { date_fin: { gt: newStart } }
                ]
            }
        });
        if (conflict) throw new Error("Conflit");

        const even = await prisma.even.create({
            data: {
                categorie,
                montant: montant ? parseFloat(montant) : null,
                avance: avance ? parseFloat(avance) : 0,
                date_debut: new Date(date_debut),
                date_fin: new Date(date_fin),
                description,
                nom_client,
                contact_client,
                type,
                salle_id,
                agent_id,
            },
        });

        // Création de la notification
        const notificationsData = await prisma.notif.create({
            data: {
                message: `Vous avez été assigné à un évènement pour le ${new Date(date_debut).toDateString("fr-FR")}.`,
                agent_id,
            },
        });


        return NextResponse.json(even, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la création de l\'évènement .' }, { status: 500 });
    }
}