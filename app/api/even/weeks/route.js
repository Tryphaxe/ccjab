import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
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

        const events = await prisma.even.findMany({
            where: {
                AND: [
                    { date_debut: { lte: new Date(end) } },
                    { date_fin: { gte: new Date(start) } }
                ]
            },
            orderBy: { date_debut: 'asc' },
            include: {
                agent: true,
                salle: true
            }
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
