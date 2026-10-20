import { SignJWT, jwtVerify } from "jose";

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export async function signJWT(payload) {
  const secretKey = getSecretKey();
  if (!secretKey) throw new Error("JWT_SECRET must be configured with at least 32 characters");
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // Le token expire dans 24h
    .sign(secretKey);
}

export async function verifyJWT(token) {
  try {
    const secretKey = getSecretKey();
    if (!secretKey) return null;
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
    return payload;
  } catch (error) {
    return null; // Token invalide ou expiré
  }
}
