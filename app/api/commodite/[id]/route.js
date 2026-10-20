import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authorize } from "@/lib/apiAuth";
import { writeAuditLog } from '@/lib/auditLog';

// Supprimer un département
export async function DELETE(request, { params }) {
  const auth = await authorize(request, ["ADMIN"]);
  if (auth.response) return auth.response;
  const { id } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.commodite.findUnique({ where: { id: parseInt(id) }, select: { id: true, nom: true } });
      await tx.salleCommodite.deleteMany({ where: { commoditeId: parseInt(id) } });
      await tx.commodite.delete({ where: { id: parseInt(id) } });
      if (target) await writeAuditLog({ actor: auth.user, action: 'DELETE', entity: 'Commodité', entityId: id, summary: `a supprimé la commodité « ${target.nom} »`, client: tx });
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
