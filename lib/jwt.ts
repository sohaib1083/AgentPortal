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

export function verifyJwtSync(token: string) {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;
    
    // Decode payload
    const decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64').toString()
    );
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < now) {
      return null;
    }
    
    return decodedPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}
