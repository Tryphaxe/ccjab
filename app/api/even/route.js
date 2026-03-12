import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendAssignmentEmail } from '@/lib/mail'; // Import de la fonction mail

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
        const { nom_evenement, categorie, montant, avance, date_debut, date_fin, description, nom_client, contact_client, type, salle_id, agent_id, image, fiche } = await req.json();

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

        // vérifier avant create (Conflits)
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

        // 1. Récupérer les infos de l'agent et de la salle POUR l'email
        // On a besoin de l'email de l'agent (qui est dans la table User/Agent) et du nom de la salle
        const agent = await prisma.user.findUnique({ // Assurez-vous que votre modèle s'appelle 'user' ou 'agent'
            where: { id: agent_id }
        });

        const salle = await prisma.salle.findUnique({
            where: { id: salle_id }
        });

        if (!agent) {
            return NextResponse.json({ error: "Agent introuvable." }, { status: 404 });
        }

        // 2. Création de l'événement
        const even = await prisma.even.create({
            data: {
                nom_evenement,
                categorie,
                montant: montant ? parseFloat(montant) : null,
                avance: avance ? parseFloat(avance) : 0,
                date_debut: newStart,
                date_fin: newEnd,
                description,
                nom_client,
                contact_client,
                type,
                salle_id,
                agent_id,
                image: image || null,
                fiche: fiche || null,
            },
        });

        // 3. Création de la notification in-app
        await prisma.notif.create({
            data: {
                message: `Vous avez été assigné à l'évènement "${nom_evenement}" pour le ${newStart.toLocaleDateString("fr-FR")}.`,
                agent_id,
            },
        });

        // 4. Envoi de l'email (Asynchrone, on n'attend pas forcément le résultat pour répondre au client)
        if (agent.email) {
            // On ne met pas 'await' ici si on veut que la réponse soit rapide, 
            // mais mettre 'await' garantit que l'email est parti avant de répondre.
            await sendAssignmentEmail(agent.email, agent.name, {
                nom_evenement,
                date_debut: newStart,
                date_fin: newEnd,
                nom_client,
                salle_nom: salle ? salle.nom_salle : 'Salle inconnue',
                type
            });
        }

        return NextResponse.json(even, { status: 201 });
    } catch (error) {
        console.error("Erreur API:", error);
        return NextResponse.json({ error: error.message || 'Erreur lors de la création de l\'évènement.' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { ids } = await req.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "Aucun ID fourni." }, { status: 400 });
        }

        // Suppression en masse avec Prisma
        const result = await prisma.even.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: `${result.count} évènements supprimés.` 
        });

    } catch (error) {
        console.error("Erreur suppression groupée:", error);
        return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 });
    }
}