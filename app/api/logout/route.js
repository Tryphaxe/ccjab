import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().delete("token"); // On détruit le cookie
  return NextResponse.json({ success: true });
}