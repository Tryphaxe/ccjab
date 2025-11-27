import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Assurez-vous que le chemin vers votre instance prisma est correct

export async function POST(req) {
  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: "Aucun ID fourni pour la suppression." },
        { status: 400 }
      );
    }

    // Suppression de masse avec Prisma
    const deletedEvents = await prisma.even.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `${deletedEvents.count} évènements supprimés avec succès.`,
      count: deletedEvents.count
    });

  } catch (error) {
    console.error("Erreur lors de la suppression multiple :", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la suppression." },
      { status: 500 }
    );
  }
}