import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/apiAuth";
import { writeAuditLog } from '@/lib/auditLog';

// GET : Récupérer tous les posts (Pour le dashboard éditeur)
export async function GET(request) {
  const auth = await authorize(request, ['ADMIN', 'EDITEUR']);
  if (auth.response) return auth.response;
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true }
        }
      }
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST : Créer un post (Sécurisé)
export async function POST(request) {
  try {
    const auth = await authorize(request, ['EDITEUR', 'ADMIN']);
    if (auth.response) return auth.response;

    const body = await request.json();
    const { titre, contenu, type, mediaUrl, isPromoted } = body;

    if (!titre || !type) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const newPost = await prisma.$transaction(async (tx) => {
    const created = await tx.post.create({
      data: {
        titre,
        contenu,
        type, // 'PUB' ou 'ACTU'
        mediaUrl,
        isPromoted: isPromoted || false,
        authorId: auth.user.id
      }
    });

    await writeAuditLog({
      actor: auth.user,
      action: 'CREATE',
      entity: 'Publication',
      entityId: created.id,
      summary: `a créé ${type === 'PUB' ? 'la publicité' : 'l’actualité'} « ${created.titre} »`,
      metadata: { type, isPromoted: created.isPromoted },
      client: tx,
    });
    return created;
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur de création" }, { status: 500 });
  }
}

// PUT : Modifier le statut (Promouvoir / Désactiver)
export async function PUT(request) {
  try {
    const auth = await authorize(request, ['EDITEUR', 'ADMIN']);
    if (auth.response) return auth.response;

    const body = await request.json();
    const { id, isPromoted } = body;

    const updatedPost = await prisma.$transaction(async (tx) => {
    const updated = await tx.post.update({
      where: { id },
      data: { isPromoted }
    });

    await writeAuditLog({
      actor: auth.user,
      action: isPromoted ? 'PROMOTE' : 'UPDATE',
      entity: 'Publication',
      entityId: updated.id,
      summary: isPromoted ? `a mis « ${updated.titre} » à la une` : `a retiré « ${updated.titre} » de la une`,
      metadata: { isPromoted: Boolean(isPromoted) },
      client: tx,
    });
    return updated;
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de modification" }, { status: 500 });
  }
}

// DELETE : Supprimer un post
export async function DELETE(request) {
  const auth = await authorize(request, ['EDITEUR', 'ADMIN']);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  try {
    await prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({ where: { id }, select: { id: true, titre: true, type: true } });
      await tx.post.delete({ where: { id } });
      if (post) await writeAuditLog({ actor: auth.user, action: 'DELETE', entity: 'Publication', entityId: id, summary: `a supprimé la publication « ${post.titre} »`, client: tx });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}
