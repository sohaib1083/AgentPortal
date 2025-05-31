import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/jwt'

export async function GET() {
  try {
    // Get the token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Verify the token
    const decoded = await verifyJwt(token)
    
    // Check if user has admin role
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // User is an admin
    return NextResponse.json({ message: 'Authorized', user: { id: decoded.id, role: decoded.role } })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
}