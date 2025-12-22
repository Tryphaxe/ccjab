import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params; // await params est requis sur les dernières versions de Next.js
    const body = await request.json();

    // On initialise l'objet vide qui va contenir SEULEMENT les champs à modifier
    const updateData = {};

    // =========================================================
    // CAS 1 : GESTION DE LA VISIBILITÉ (Switch)
    // =========================================================
    // On vérifie spécifiquement si 'visible' est défini (même si c'est false)
    if (body.visible !== undefined) {
      // ATTENTION : Vérifiez votre schema.prisma. 
      // Si votre champ s'appelle "visible", utilisez la ligne ci-dessous :
      updateData.visible = body.visible;

      // Si votre champ s'appelle "visible", utilisez : updateData.visible = body.visible;
    }

    // =========================================================
    // CAS 2 : MODIFICATION DES INFOS (Formulaire)
    // =========================================================
    // 1. Nom
    if (body.nom_salle !== undefined) updateData.nom_salle = body.nom;
    else if (body.nom_salle !== undefined) updateData.nom_salle = body.nom_salle;

    // 2. Capacité
    if (body.nombre_place !== undefined) updateData.nombre_place = parseInt(body.nombre_place);
    else if (body.nombre_place !== undefined) updateData.nombre_place = parseInt(body.nombre_place);

    // 3. Image
    if (body.image !== undefined) updateData.image = body.image;

    // 4. Commodités (Relation Many-to-Many)
    // On ne touche aux commodités QUE si le tableau est fourni
    if (body.commodites) {
      updateData.commodites = {
        deleteMany: {}, // On supprime les anciennes liaisons
        create: body.commodites.map((commoditeId) => ({
          commoditeId: parseInt(commoditeId), // On recrée les nouvelles
        })),
      };
    }

    // =========================================================
    // EXÉCUTION DE LA MISE À JOUR
    // =========================================================
    // Si updateData est vide (rien envoyé), on évite de faire une requête inutile
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Aucune donnée à mettre à jour" });
    }

    const updatedSalle = await prisma.salle.update({
      where: { id: id },
      data: updateData,
      // Optionnel : Inclure les commodités dans la réponse pour mise à jour immédiate du front
      include: {
        commodites: {
          include: { commodite: true }
        }
      }
    });

    return NextResponse.json(updatedSalle);

  } catch (error) {
    console.error("❌ Erreur API PATCH Salle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la salle" },
      { status: 500 }
    );
  }
}

// Supprimer une salle
export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    await prisma.salle.delete({
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