import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 📄 GET : liste de toutes les users
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { name: 'asc' },
            where: { role: "AGENT" }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la récupération.' }, { status: 500 });
    }
}