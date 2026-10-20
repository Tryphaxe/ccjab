import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendAssignmentEmail } from '@/lib/mail'; // Import de la fonction mail
import { authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

// 📄 GET : liste de toutes les evens
export async function GET(request) {
    const auth = await authorize(request, ['ADMIN', 'FINANCIER', 'AGENT', 'ASSISTANT']);
    if (auth.response) return auth.response;
    try {
        const evens = await prisma.even.findMany({
            where: auth.user.role === 'AGENT' ? { agent_id: auth.user.id } : undefined,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, nom_evenement: true, categorie: true, montant: true, avance: true,
                date_debut: true, date_fin: true, description: true, nom_client: true,
                contact_client: true, type: true, visible: true, organise_par_ccjab: true, fiche: true, image: true,
                createdAt: true, agent_id: true,
                salles: { select: { id: true, nom_salle: true, nombre_place: true } },
                agent: { select: { id: true, name: true } },
                ...(auth.user.role === 'ADMIN' || auth.user.role === 'FINANCIER' ? { payments: { select: { amount: true, paidAt: true, isInitialAdvance: true, isLegacyEstimate: true } } } : {}),
            },
        });
        return NextResponse.json(evens);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
    }
}

// ➕ POST : créer une nouvelle even
export async function POST(req) {
    const auth = await authorize(req, ['ADMIN', 'AGENT']);
    if (auth.response) return auth.response;
    try {
        const { nom_evenement, categorie, montant, avance, date_debut, date_fin, description, nom_client, contact_client, type, salle_ids, agent_id: requestedAgentId, image, fiche, organise_par_ccjab } = await req.json();
        const agent_id = auth.user.role === 'AGENT' ? auth.user.id : requestedAgentId;

        // Vérification simple avant insertion
        if (!nom_client?.trim() || !categorie?.trim() || !Array.isArray(salle_ids) || salle_ids.length === 0 || !agent_id || !type?.trim() || !date_debut || !date_fin) {
            return NextResponse.json(
                { error: "Certains champs obligatoires sont manquants." },
                { status: 400 }
            );
        }

        // Conversion en Date
        const newStart = new Date(date_debut);
        const newEnd = new Date(date_fin);
        const amount = montant === '' || montant == null ? null : Number(montant);
        const paid = avance === '' || avance == null ? 0 : Number(avance);
        if (!Number.isFinite(newStart.getTime()) || !Number.isFinite(newEnd.getTime()) || newStart >= newEnd) {
            return NextResponse.json({ error: 'Les dates de début et de fin sont invalides.' }, { status: 400 });
        }
        if (organise_par_ccjab !== undefined && typeof organise_par_ccjab !== 'boolean') {
            return NextResponse.json({ error: 'Le statut d’organisateur est invalide.' }, { status: 400 });
        }
        if ((amount !== null && (!Number.isFinite(amount) || amount < 0)) || !Number.isFinite(paid) || paid < 0 || (amount !== null && paid > amount)) {
            return NextResponse.json({ error: 'Les montants doivent être positifs et l’avance ne peut pas dépasser le montant total.' }, { status: 400 });
        }
        if (salle_ids.some(id => typeof id !== 'string') || new Set(salle_ids).size !== salle_ids.length) {
            return NextResponse.json({ error: 'La sélection des salles est invalide.' }, { status: 400 });
        }

        // 1. Récupérer les infos de l'agent et de la salle POUR l'email
        // On a besoin de l'email de l'agent (qui est dans la table User/Agent) et du nom de la salle
        const agent = await prisma.user.findUnique({ // Assurez-vous que votre modèle s'appelle 'user' ou 'agent'
            where: { id: agent_id }
        });
        const sallesConcernees = await prisma.salle.findMany({ where: { id: { in: salle_ids } } });
        const nomDesSalles = sallesConcernees.map(s => s.nom_salle).join(' + ');

        if (!agent) {
            return NextResponse.json({ error: "Agent introuvable." }, { status: 404 });
        }

        // 2. Création de l'événement
        const even = await prisma.$transaction(async (tx) => {
            const conflict = await tx.even.findFirst({
                where: { salles: { some: { id: { in: salle_ids } } }, date_debut: { lt: newEnd }, date_fin: { gt: newStart } },
                select: { id: true },
            });
            if (conflict) {
                const error = new Error('Une salle sélectionnée est déjà réservée sur cette période.');
                error.code = 'ROOM_CONFLICT';
                throw error;
            }
            const created = await tx.even.create({
                data: {
                nom_evenement,
                categorie,
                montant: amount,
                avance: paid,
                date_debut: newStart,
                date_fin: newEnd,
                description,
                nom_client,
                contact_client,
                type,
                organise_par_ccjab: organise_par_ccjab === true,
                salles: {
                    connect: salle_ids.map(id => ({ id }))
                },
                agent_id,
                image: image || null,
                fiche: fiche || null,
                },
            });
            if (paid > 0) {
                await tx.evenPayment.create({
                    data: {
                        eventId: created.id,
                        amount: paid,
                        paidAt: new Date(),
                        method: 'À préciser',
                        note: 'Avance initiale saisie lors de la création de l’événement.',
                        isInitialAdvance: true,
                        isLegacyEstimate: true,
                        createdById: auth.user.id,
                    },
                });
            }
            await writeAuditLog({ actor: auth.user, action: 'CREATE', entity: 'Évènement', entityId: created.id, summary: `a créé l’évènement « ${created.nom_evenement || created.categorie} »`, client: tx });
            await tx.notif.create({
                data: { message: `Vous avez été assigné à l'évènement "${nom_evenement}" pour le ${newStart.toLocaleDateString("fr-FR")}.`, agent_id },
            });
            return created;
        }, { isolationLevel: 'Serializable' });

        // 4. Envoi de l'email (Asynchrone, on n'attend pas forcément le résultat pour répondre au client)
        if (agent.email) {
            // On ne met pas 'await' ici si on veut que la réponse soit rapide, 
            // mais mettre 'await' garantit que l'email est parti avant de répondre.
            await sendAssignmentEmail(agent.email, agent.name, {
                nom_evenement,
                date_debut: newStart,
                date_fin: newEnd,
                nom_client,
                salle_nom: nomDesSalles || 'Salles multiples',
                type
            }).catch((emailError) => console.error('Échec du courriel d’affectation:', emailError));
        }

        return NextResponse.json(even, { status: 201 });
    } catch (error) {
        console.error("Erreur API:", error);
        if (error.code === 'ROOM_CONFLICT' || error.code === 'P2034') {
            return NextResponse.json({ error: 'Une salle sélectionnée est déjà réservée sur cette période. Actualisez la liste et réessayez.' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message || 'Erreur lors de la création de l\'évènement.' }, { status: 500 });
    }
}

export async function DELETE(req) {
    const auth = await authorize(req, ['ADMIN']);
    if (auth.response) return auth.response;
    try {
        const { ids } = await req.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "Aucun ID fourni." }, { status: 400 });
        }

        // Suppression et journalisation dans une transaction unique.
        const result = await prisma.$transaction(async (tx) => {
            const deleted = await tx.even.deleteMany({ where: { id: { in: ids } } });
            if (deleted.count > 0) await writeAuditLog({
                actor: auth.user,
                action: 'DELETE',
                entity: 'Évènement',
                summary: `a supprimé ${deleted.count} évènement${deleted.count > 1 ? 's' : ''}`,
                metadata: { count: deleted.count, ids: ids.slice(0, 50) },
                client: tx,
            });
            return deleted;
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
