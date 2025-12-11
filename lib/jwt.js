import { SignJWT, jwtVerify } from "jose";

// Clé secrète (A mettre impérativement dans ton .env plus tard !)
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "mon-super-secret-indechiffrable");

export async function signJWT(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // Le token expire dans 24h
    .sign(SECRET_KEY);
}

export async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    return null; // Token invalide ou expiré
  }
}