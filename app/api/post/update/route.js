import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

export async function PUT(request) {
    try {
    const token = request.cookies.get("token")?.value;
    const payload = token ? await verifyJWT(token) : null;

    if (!payload || (payload.role !== 'EDITEUR' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

        const body = await request.json();
        const { id, titre, contenu, type, mediaUrl, isPromoted } = body;

        if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

        const updatedPost = await prisma.post.update({
            where: { id },
            data: {
                titre,
                contenu,
                type,
                mediaUrl, // Mettra à jour l'image si une nouvelle URL est envoyée
                isPromoted
            }
        });
    
        return NextResponse.json(updatedPost);
    } catch (error) {
        return NextResponse.json({ error: "Erreur de modification" }, { status: 500 });
    }
}