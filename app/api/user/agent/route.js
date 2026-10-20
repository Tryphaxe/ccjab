import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';

// 📄 GET : liste de toutes les users
export async function GET(request) {
    const auth = await authorize(request, ['ADMIN', 'AGENT', 'FINANCIER', 'ASSISTANT']);
    if (auth.response) return auth.response;
    try {
        const users = await prisma.user.findMany({
            orderBy: { name: 'asc' },
            where: { role: "AGENT" },
            select: auth.user.role === 'ASSISTANT'
                ? { id: true, name: true }
                : { id: true, name: true, contact: true, email: true, role: true }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
    }
}
