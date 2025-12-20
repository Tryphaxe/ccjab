import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;

    // Récupérer les données envoyées (le boolean visible)
    const body = await request.json();
    const { visible } = body;

    // Mise à jour dans la base de données
    const updatedSalle = await prisma.salle.update({
      where: { id: id },
      data: {
        visible: visible,
      },
    });

    return NextResponse.json(updatedSalle);
  } catch (error) {
    console.error("Erreur API PATCH Salle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la salle" },
      { status: 500 }
    );
  }
}

// Supprimer un département
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