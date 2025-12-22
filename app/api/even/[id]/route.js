import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Supprimer un département
export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    await prisma.even.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Delete success" }, { status: 200 });
  } catch (error) {
    console.error("Erreur suppression : ", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // On prépare l'objet de mise à jour
    // On ne remplit que les champs qui sont présents dans la requête
    const updateData = {};

    // 1. GESTION DE LA VISIBILITÉ (Switch)
    if (body.visible !== undefined) {
      updateData.visible = body.visible;
    }

    // 2. GESTION DU FORMULAIRE ET DE L'IMAGE
    
    // Champs Textes
    if (body.nom_client !== undefined) updateData.nom_client = body.nom_client;
    if (body.contact_client !== undefined) updateData.contact_client = body.contact_client;
    if (body.categorie !== undefined) updateData.categorie = body.categorie;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.description !== undefined) updateData.description = body.description;
    
    // Champ Image
    if (body.image !== undefined) updateData.image = body.image;
    if (body.fiche !== undefined) updateData.fiche = body.fiche;

    // Champs Numériques (Conversion nécessaire String -> Float)
    if (body.montant !== undefined) updateData.montant = parseFloat(body.montant) || 0;
    if (body.avance !== undefined) updateData.avance = parseFloat(body.avance) || 0;

    // Champs Dates (Conversion nécessaire String ISO -> Date Object)
    if (body.date_debut !== undefined) updateData.date_debut = new Date(body.date_debut);
    if (body.date_fin !== undefined) updateData.date_fin = new Date(body.date_fin);

    // Relations (Salle & Agent)
    // On gère le cas où l'utilisateur sélectionne "Aucune salle" (chaîne vide -> null)
    if (body.salle_id !== undefined) {
        updateData.salle_id = body.salle_id === "" ? null : body.salle_id;
    }
    if (body.agent_id !== undefined) {
        updateData.agent_id = body.agent_id === "" ? null : body.agent_id;
    }

    // Sécurité : Si aucune donnée valide n'est envoyée, on arrête là
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Aucune donnée à modifier" }, { status: 400 });
    }

    // Mise à jour effective
    const updatedEvent = await prisma.even.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json(updatedEvent, { status: 200 });

  } catch (error) {
    
    // Gestion spécifique si l'événement n'existe pas
    if (error.code === 'P2025') {
        return NextResponse.json({ error: "Évènement introuvable." }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'évènement." },
      { status: 500 }
    );
  }
}