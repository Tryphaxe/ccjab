import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

// GET : Récupérer tous les posts (Pour le dashboard éditeur)
export async function GET(request) {
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
    const token = request.cookies.get("token")?.value;
    const payload = token ? await verifyJWT(token) : null;

    if (!payload || (payload.role !== 'EDITEUR' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { titre, contenu, type, mediaUrl, isPromoted } = body;

    if (!titre || !type) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const newPost = await prisma.post.create({
      data: {
        titre,
        contenu,
        type, // 'PUB' ou 'ACTU'
        mediaUrl,
        isPromoted: isPromoted || false,
        authorId: payload.id
      }
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
    const token = request.cookies.get("token")?.value;
    const payload = token ? await verifyJWT(token) : null;

    if (!payload || (payload.role !== 'EDITEUR' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { id, isPromoted } = body;

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { isPromoted }
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de modification" }, { status: 500 });
  }
}

// DELETE : Supprimer un post
export async function DELETE(request) {
  const token = request.cookies.get("token")?.value;
  const payload = token ? await verifyJWT(token) : null;

  if (!payload || (payload.role !== 'EDITEUR' && payload.role !== 'ADMIN')) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  try {
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}