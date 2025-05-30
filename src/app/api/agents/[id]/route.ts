import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Agent from '@/models/Agent'

// Properly typed context using Next.js App Router's RouteParams
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect()
  const { id } = params

  try {
    await Agent.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Agent deleted' }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: 'Failed to delete agent' }, { status: 500 })
  }
}
