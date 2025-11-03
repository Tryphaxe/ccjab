import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Supprimer un département
export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    await prisma.user.delete({
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
    const { id } = params;
    const dataToUpdate = await req.json();

    // Supprime l'id s'il est présent dans le body
    delete dataToUpdate.id;

    // Vérifie que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Si l'email est inchangé, on l'enlève du body
    if (dataToUpdate.email === existingUser.email) {
      delete dataToUpdate.email;
    }

    // Vérifie si un autre utilisateur a déjà cet email
    if (dataToUpdate.email) {
      const otherUser = await prisma.user.findUnique({
        where: { email: dataToUpdate.email },
      });

      if (otherUser && otherUser.id !== id) {
        return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
      }
    }

    // ✅ Mise à jour de l'utilisateur
    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Erreur update user :", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}