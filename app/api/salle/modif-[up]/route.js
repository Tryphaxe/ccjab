import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// app/api/salles/[id]/route.js

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // On prépare l'objet de mise à jour
    const updateData = {};

    // 1. Champs simples (s'ils sont présents dans la requête)
    if (body.nom !== undefined) updateData.nom_salle = body.nom;
    if (body.capacite !== undefined) updateData.nombre_place = parseInt(body.capacite);
    if (body.visible !== undefined) updateData.visible = body.est_visible;

    // 2. Gestion des Commodités (Relation Many-to-Many explicite)
    // Si on reçoit une liste de commodités, on remplace tout.
    if (body.commodites) {
      updateData.commodites = {
        deleteMany: {}, // On supprime les anciennes liaisons
        create: body.commodites.map((commoditeId) => ({
          commoditeId: parseInt(commoditeId), // On recrée les nouvelles
        })),
      };
    }

    const updatedSalle = await prisma.salle.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json(updatedSalle);
  } catch (error) {
    console.error("Erreur API PATCH Salle:", error);
    return NextResponse.json({ error: "Erreur update" }, { status: 500 });
  }
}