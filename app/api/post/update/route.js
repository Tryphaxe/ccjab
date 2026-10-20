import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/apiAuth";
import { writeAuditLog } from '@/lib/auditLog';

export async function PUT(request) {
    try {
    const auth = await authorize(request, ['EDITEUR', 'ADMIN']);
    if (auth.response) return auth.response;

        const body = await request.json();
        const { id, titre, contenu, type, mediaUrl, isPromoted } = body;

        if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

        const updatedPost = await prisma.$transaction(async (tx) => {
        const updated = await tx.post.update({
            where: { id },
            data: {
                titre,
                contenu,
                type,
                mediaUrl, // Mettra à jour l'image si une nouvelle URL est envoyée
                isPromoted
            }
        });

        await writeAuditLog({
            actor: auth.user,
            action: 'UPDATE',
            entity: 'Publication',
            entityId: updated.id,
            summary: `a modifié la publication « ${updated.titre} »`,
            metadata: { changedFields: ['titre', 'contenu', 'type', 'mediaUrl', 'isPromoted'].filter((field) => body[field] !== undefined) },
            client: tx,
        });
        return updated;
        });
    
        return NextResponse.json(updatedPost);
    } catch (error) {
        return NextResponse.json({ error: "Erreur de modification" }, { status: 500 });
    }
}
