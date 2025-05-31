import jwt from 'jsonwebtoken';

// Ensure your signJwt function properly serializes ObjectIds to strings
export async function signJwt(payload: any) {
  // Make sure ObjectId is properly serialized to string
  const processedPayload = {
    ...payload,
    // If id is an ObjectId, convert to string
    id: payload.id && typeof payload.id.toString === 'function' 
      ? payload.id.toString() 
      : payload.id
  };
  
  return jwt.sign(
    processedPayload, 
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
}

export async function verifyJwt(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}
