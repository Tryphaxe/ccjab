import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/apiAuth";

export async function GET(request) {
  const auth = await authorize(request, ["AGENT"]);
  if (auth.response) return auth.response;

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notif.findMany({
        where: { agent_id: auth.user.id },
        orderBy: { created_at: "desc" },
        take: 100,
        select: { id: true, message: true, created_at: true, isRead: true },
      }),
      prisma.notif.count({ where: { agent_id: auth.user.id, isRead: false } }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Erreur de lecture des notifications:", error);
    return NextResponse.json({ error: "Impossible de récupérer les notifications." }, { status: 500 });
  }
}

export async function PATCH(request) {
  const auth = await authorize(request, ["AGENT"]);
  if (auth.response) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    if (body?.markAllRead === true) {
      const result = await prisma.notif.updateMany({
        where: { agent_id: auth.user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ updated: result.count });
    }

    if (typeof body?.id !== "string" || !body.id.trim()) {
      return NextResponse.json({ error: "Identifiant de notification manquant." }, { status: 400 });
    }

    const result = await prisma.notif.updateMany({
      where: { id: body.id, agent_id: auth.user.id, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ updated: result.count });
  } catch (error) {
    console.error("Erreur de mise à jour des notifications:", error);
    return NextResponse.json({ error: "Impossible de mettre à jour les notifications." }, { status: 500 });
  }
}
