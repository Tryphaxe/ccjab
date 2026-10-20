import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authorize } from '@/lib/apiAuth';

export async function GET(req) {
    const auth = await authorize(req, ['ADMIN', 'FINANCIER', 'AGENT', 'ASSISTANT']);
    if (auth.response) return auth.response;
    try {
        const { searchParams } = new URL(req.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        if (!start || !end) {
            return NextResponse.json(
                { error: "start et end sont requis" },
                { status: 400 }
            );
        }

        const startDate = new Date(start);
        const endDate = new Date(end);
        if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime()) || startDate > endDate) {
            return NextResponse.json({ error: 'La période demandée est invalide.' }, { status: 400 });
        }
        const events = await prisma.even.findMany({
            where: {
                ...(auth.user.role === 'AGENT' ? { agent_id: auth.user.id } : {}),
                AND: [
                    { date_debut: { lte: endDate } },
                    { date_fin: { gte: startDate } }
                ]
            },
            orderBy: { date_debut: 'asc' },
            select: {
                id: true, nom_evenement: true, categorie: true, date_debut: true,
                date_fin: true, visible: true, type: true, agent_id: true,
                organise_par_ccjab: true,
                ...(auth.user.role === 'AGENT' ? {} : { montant: true, avance: true, nom_client: true, contact_client: true }),
                agent: { select: { id: true, name: true } },
                salles: { select: { id: true, nom_salle: true } },
            }
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
