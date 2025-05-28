import { SignJWT, jwtVerify, type JWTPayload } from 'jose';


const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret');

export async function signJwt(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyJwt(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}
