import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Assurez-vous que le chemin vers votre instance prisma est correct
import { authorize } from "@/lib/apiAuth";
import { writeAuditLog } from '@/lib/auditLog';

export async function POST(req) {
  const auth = await authorize(req, ["ADMIN"]);
  if (auth.response) return auth.response;
  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: "Aucun ID fourni pour la suppression." },
        { status: 400 }
      );
    }

    if (ids.length > 100) return NextResponse.json({ message: 'Limite de 100 éléments par suppression.' }, { status: 400 });
    const deletedEvents = await prisma.$transaction(async (tx) => {
      const deleted = await tx.even.deleteMany({ where: { id: { in: ids } } });
      if (deleted.count > 0) await writeAuditLog({
        actor: auth.user,
        action: 'DELETE',
        entity: 'Évènement',
        summary: `a supprimé ${deleted.count} évènement${deleted.count > 1 ? 's' : ''}`,
        metadata: { count: deleted.count, ids: ids.slice(0, 50) },
        client: tx,
      });
      return deleted;
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
