import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. Récupérer le cookie
  const token = request.cookies.get("token")?.value;
  
  // 2. Vérifier le token
  const payload = token ? await verifyJWT(token) : null;

  // 3. Définir les règles de protection
  const isAuth = !!payload;
  const isLoginPage = pathname.startsWith("/auth/login");
  
  // Chemins protégés par rôle
  const isAdminPath = pathname.startsWith("/dashboard");
  const isFinancePath = pathname.startsWith("/finance");
  const isAgentPath = pathname.startsWith("/agent");

  // A. Si non connecté et essaie d'accéder à une page protégée
  if (!isAuth && (isAdminPath || isFinancePath || isAgentPath)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // B. Si connecté mais essaie d'aller sur login (on le renvoie chez lui)
  if (isAuth && isLoginPage) {
    if (payload.role === 'ADMIN') return NextResponse.redirect(new URL("/dashboard/home", request.url));
    if (payload.role === 'FINANCIER') return NextResponse.redirect(new URL("/finance/dashboard", request.url));
    if (payload.role === 'AGENT') return NextResponse.redirect(new URL("/agent/home", request.url));
  }

  // C. Protection par Rôle (Exemple: un AGENT essaie d'aller sur /dashboard)
  if (isAuth) {
    if (isAdminPath && payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    if (isFinancePath && payload.role !== "FINANCIER" && payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

// Configurer sur quelles routes le middleware s'active
export const config = {
  matcher: ["/dashboard/:path*", "/financial/:path*", "/agent/:path*"],
};