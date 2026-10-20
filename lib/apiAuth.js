import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import prisma from "@/lib/prisma";

/** Authenticate API requests and optionally enforce an allowed role list. */
export async function authorize(request, allowedRoles = []) {
  const token = request.cookies.get("token")?.value;
  const payload = token ? await verifyJWT(token) : null;

  if (!payload?.id || !payload?.role) {
    return { response: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) {
    return { response: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return { response: NextResponse.json({ error: "Accès interdit" }, { status: 403 }) };
  }

  return { user };
}
