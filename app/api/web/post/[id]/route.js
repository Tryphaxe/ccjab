import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: id },
      include: {
        author: {
          select: { name: true } // On récupère le nom de l'auteur si disponible
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Erreur récupération article:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}