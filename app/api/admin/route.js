import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 📄 GET : liste de toutes les admins
export async function GET() {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(admins);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
    }
}

// ➕ POST : créer une nouvelle admin
export async function POST(req) {
    try {
        const { name, contact, email, password } = await req.json();

        if (!name || !contact || !email || !password) {
            return NextResponse.json({ error: 'Tous les champs sont requis !' }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await prisma.user.create({
            data: {
                name,
                contact,
                email,
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        return NextResponse.json(admin, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la création de l\'admin .' }, { status: 500 });
    }
}