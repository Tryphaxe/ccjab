import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

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

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const data = await req.json();

    // Vérifie si l'évènement existe
    const existingEvent = await prisma.even.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Évènement introuvable." }, { status: 404 });
    }

    // Met à jour l'évènement
    const updatedEvent = await prisma.even.update({
      where: { id },
      data: {
        nom: data.nom,
        contact: data.contact,
        datetimeDebut: data.datetimeDebut,
        datetimeFin: data.datetimeFin,
        salle: data.salle,
        type: data.type,
        categorie: data.categorie,
        montant: data.montant,
        description: data.description,
        agent: data.agent,
      },
    });

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'évènement :", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'évènement." },
      { status: 500 }
    );
  }
}