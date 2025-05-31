import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Agent from '@/models/Agent';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';

// Modify your GET function to ensure all agents have commission percentages
export async function GET() {
  await dbConnect();
  
  try {
    const agents = await Agent.find({}).lean();
    
    // Ensure all agents have commission percentages
    const agentsWithDefaults = agents.map(agent => ({
      ...agent,
      agentCommissionPercentage: agent.agentCommissionPercentage === undefined ? 60 : agent.agentCommissionPercentage,
      organizationCommissionPercentage: agent.organizationCommissionPercentage === undefined ? 40 : agent.organizationCommissionPercentage
    }));
    
    const response = NextResponse.json(agentsWithDefaults);
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ message: 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  
  try {
    const body = await req.json();
    console.log('Creating agent with data:', body);
    
    // Create agent directly specifying all fields
    const agentDoc = {
      name: body.name,
      email: body.email,
      password: body.password,
      level: body.level || 'L1',
      totalSales: body.totalSales || 0,
      agentCommissionPercentage: Number(body.agentCommissionPercentage || 60),
      organizationCommissionPercentage: Number(body.organizationCommissionPercentage || 40)
    };
    
    console.log('Final agent document to create:', agentDoc);
    
    const newAgent = await Agent.create(agentDoc);
    
    // Verify the created agent
    console.log('New agent created, full document:', newAgent);
    console.log('Commission fields present:', 
      'agentCommissionPercentage' in newAgent, 
      'organizationCommissionPercentage' in newAgent
    );
    
    // Return the agent without password
    const response = newAgent.toObject();
    delete response.password;
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ message: 'Failed to create agent' }, { status: 500 });
  }
}
