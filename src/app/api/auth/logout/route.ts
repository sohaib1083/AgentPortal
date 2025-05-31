import { NextResponse } from 'next/server'

export async function POST() {
  // Create response
  const response = NextResponse.json({ message: 'Logged out successfully' })
  
  // Clear the token cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0, // Immediately expire the cookie
  })
  
  return response
}