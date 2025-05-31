import { NextResponse } from 'next/server';
import { signJwt } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Simple admin authentication
    if (username !== 'NexusAdmin' || password !== 'Sohaib@2002') {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT with admin role
    const token = await signJwt({ 
      id: 'admin-id',
      role: 'admin'
    });

    // Create and configure the response
    const response = NextResponse.json({ message: 'Login successful' });
    
    // Set the token cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // IMPORTANT: Don't forget to return the response!
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ message: 'Login failed' }, { status: 500 });
  }
}