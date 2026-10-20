import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

// 📄 GET : liste de toutes les users
export async function GET(request) {
    const auth = await authorize(request, ['ADMIN']);
    if (auth.response) return auth.response;
    try {
        const users = await prisma.user.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true, contact: true, email: true, role: true },
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
    }
}

// ➕ POST : créer user
export async function POST(req) {
    const auth = await authorize(req, ['ADMIN']);
    if (auth.response) return auth.response;
    try {
        const { name, contact, email, password, role } = await req.json();

        if (!name || !contact || !email || !password || !role) {
            return NextResponse.json({ error: 'Tous les champs sont requis !' }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
            data: {
                name,
                contact,
                email,
                password: hashedPassword,
                role,
            },
            select: { id: true, name: true, contact: true, email: true, role: true },
        });

        await writeAuditLog({ actor: auth.user, action: 'CREATE', entity: 'Utilisateur', entityId: created.id, summary: `a créé le compte de ${created.name}`, metadata: { role: created.role }, client: tx });
        return created;
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la création de l\'user .' }, { status: 500 });
    }
}
