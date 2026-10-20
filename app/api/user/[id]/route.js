import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { authorize } from "@/lib/apiAuth";
import { writeAuditLog } from '@/lib/auditLog';

// Supprimer un département
export async function DELETE(request, { params }) {
  const auth = await authorize(request, ["ADMIN"]);
  if (auth.response) return auth.response;
  const { id } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id }, select: { id: true, name: true, role: true } });
      await tx.user.delete({ where: { id } });
      if (target) await writeAuditLog({ actor: auth.user, actorId: auth.user.id === id ? null : auth.user.id, action: 'DELETE', entity: 'Utilisateur', entityId: id, summary: `a supprimé le compte de ${target.name}`, metadata: { role: target.role }, client: tx });
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
  const auth = await authorize(req, ["ADMIN"]);
  if (auth.response) return auth.response;
  try {
    const { id } = await params;
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

    if (dataToUpdate.password) {
      // S'assurer que le mot de passe n'est pas vide avant de le crypter
      if (dataToUpdate.password.trim() === "") {
        delete dataToUpdate.password; // On l'ignore s'il est vide
      } else {
        const saltRounds = 10;
        dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, saltRounds);
      }
    }

    // ✅ Mise à jour de l'utilisateur
    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id }, data: dataToUpdate });
      await writeAuditLog({
        actor: auth.user,
        action: 'UPDATE',
        entity: 'Utilisateur',
        entityId: id,
        summary: `a modifié le compte de ${user.name}`,
        metadata: { changedFields: Object.keys(dataToUpdate).filter((field) => field !== 'password') },
        client: tx,
      });
      return user;
    });

    const { password: _password, ...safeUser } = updated;
    return NextResponse.json(safeUser, { status: 200 });
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
