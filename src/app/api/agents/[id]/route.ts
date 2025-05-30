import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Agent from '@/models/Agent'

type Params = {
  params: {
    id: string
  }
}

export async function DELETE(
  req: NextRequest,
  context: Awaited<Params>  // ✅ Notice Awaited
) {
  await dbConnect()
  const { id } = context.params

  try {
    await Agent.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Agent deleted' }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: 'Failed to delete agent' }, { status: 500 })
  }
}
