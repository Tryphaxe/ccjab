import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 📄 GET : liste de toutes les users
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
    }
}

// ➕ POST : créer user
export async function POST(req) {
    try {
        const { name, contact, email, password, role } = await req.json();

        if (!name || !contact || !email || !password || !role) {
            return NextResponse.json({ error: 'Tous les champs sont requis !' }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                contact,
                email,
                password: hashedPassword,
                role,
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la création de l\'user .' }, { status: 500 });
    }
}