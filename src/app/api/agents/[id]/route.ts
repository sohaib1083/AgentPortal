import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Agent from '@/models/Agent'

export async function DELETE(_: Request, context: { params: { id: string } }) {
  const { id } = context.params
  await dbConnect()

  try {
    await Agent.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Agent deleted' }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: 'Failed to delete agent' }, { status: 500 })
  }
}
