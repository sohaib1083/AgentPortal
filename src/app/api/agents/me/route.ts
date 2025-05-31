import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Agent from '@/models/Agent';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';
import mongoose from 'mongoose';

export async function GET() {
  await dbConnect();

  // Check authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the token
    const decoded = await verifyJwt(token);
    
    if (!decoded || !decoded.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract the agent ID from the token
    const agentId = decoded.id;
    
    // Handle different types of IDs that might come from the JWT
    let agentIdString = agentId;
    
    // Find the agent using the string ID
    const agent = await Agent.findById(agentIdString).lean();

    if (!agent) {
      return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    }

    // Remove sensitive data
    const { password, ...agentData } = agent;

    return NextResponse.json(agentData);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching agent data' },
      { status: 500 }
    );
  }
}
