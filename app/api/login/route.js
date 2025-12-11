import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs"; // ✅ Import de bcryptjs

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // 1. Validation basique des champs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    // 2. Chercher l'utilisateur dans la base de données
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // 3. Vérification de l'utilisateur et du mot de passe
    // On vérifie d'abord si l'user existe, PUIS on compare le hash
    const isPasswordValid = user && (await bcrypt.compare(password, user.password));

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Identifiants incorrects." },
        { status: 401 }
      );
    }

    // 4. Créer le Token JWT (Payload)
    // On y met l'ID et le Rôle (c'est ce qui servira dans le middleware)
    const token = await signJWT({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    // 5. Définir le Cookie HttpOnly sécurisé
    cookies().set({
      name: "token",
      value: token,
      httpOnly: true, // 🔒 Invisible pour le JavaScript client
      secure: process.env.NODE_ENV === "production", // HTTPS obligatoire en prod
      sameSite: "strict", // Protection contre les attaques CSRF
      path: "/", // Accessible sur tout le site
      maxAge: 60 * 60 * 24, // Expire dans 24 heures
    });

    // 6. Réponse au client
    // On renvoie les infos de l'user (SANS le mot de passe) pour l'affichage
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Erreur Login:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la connexion." },
      { status: 500 }
    );
  }
}