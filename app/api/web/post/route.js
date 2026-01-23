import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'ACTU' ou 'PUB'
  const promotedOnly = searchParams.get('promoted'); // 'true'

  try {
    const whereClause = {};
    if (type) whereClause.type = type;
    if (promotedOnly === 'true') whereClause.isPromoted = true;

    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        titre: true,
        contenu: true,
        mediaUrl: true,
        type: true,
        isPromoted: true,
        createdAt: true,
      }
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: "Erreur récupération" }, { status: 500 });
  }
}