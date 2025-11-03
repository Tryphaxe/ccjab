import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 📄 GET : liste de toutes les agents
export async function GET() {
    try {
        const agents = await prisma.user.findMany({
            where: { role: 'AGENT' },
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(agents);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
    }
}

// ➕ POST : créer une nouvelle agent
export async function POST(req) {
    try {
        const { name, contact, email, password } = await req.json();

        if (!name || !contact || !email || !password) {
            return NextResponse.json({ error: 'Tous les champs sont requis !' }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const agent = await prisma.user.create({
            data: {
                name,
                contact,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json(agent, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la création de l\'agent .' }, { status: 500 });
    }
}