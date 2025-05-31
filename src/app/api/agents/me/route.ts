import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Agent from '@/models/Agent'
import { verifyJwt } from '@/lib/jwt'

export async function GET() {
  await dbConnect()

  const cookieStore = await cookies() // ✅ no await
  const token = cookieStore.get('token')?.value

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const decoded = await verifyJwt(token)
  const agentId = decoded?.id

  if (!agentId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const agent = await Agent.findById(agentId).lean()

  if (!agent) {
    return NextResponse.json({ message: 'Agent not found' }, { status: 404 })
  }

  return NextResponse.json(agent, { status: 200 })
}
