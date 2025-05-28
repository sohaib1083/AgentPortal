import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Agent from '@/models/Agent'

export async function POST(req: Request) {
  await dbConnect()
  const { agentId, amount } = await req.json()

  try {
    const agent = await Agent.findByIdAndUpdate(
      agentId,
      { $inc: { totalSales: amount } },
      { new: true }
    )

    // Auto-promotion to L2
    if (agent.totalSales >= 500000 && agent.level === 'L1') {
      agent.level = 'L2'
      await agent.save()
    }

    return NextResponse.json(agent)
  } catch (error) {
    return NextResponse.json({ message: 'Failed to submit sale' }, { status: 400 })
  }
}
