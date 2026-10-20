import { NextResponse } from "next/server";

export function ticketingMaintenanceResponse() {
  return NextResponse.json(
    { error: "La billetterie du tableau de bord est temporairement indisponible." },
    { status: 503 }
  );
}
