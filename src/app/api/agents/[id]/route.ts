import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Agent from '@/models/Agent'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/jwt'
import bcrypt from 'bcryptjs'


type Params = {
  params: {
    id: string
  }
}

export async function DELETE(
  req: NextRequest,
  context: Params  // Remove the Awaited wrapper
) {
  await dbConnect()
  
  // Access params directly without destructuring
  const id = context.params.id

  try {
    await Agent.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Agent deleted' }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: 'Failed to delete agent' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const id = params.id;
  
  try {
    const body = await req.json();
    console.log('Updating agent with data:', body);
    
    // Validate commission percentages if provided
    if (
      body.agentCommissionPercentage !== undefined && 
      body.organizationCommissionPercentage !== undefined
    ) {
      if (body.agentCommissionPercentage + body.organizationCommissionPercentage !== 100) {
        return NextResponse.json(
          { message: 'Commission percentages must total 100%' }, 
          { status: 400 }
        );
      }
    }
    
    // Use findOne + save instead of findByIdAndUpdate to ensure all middleware runs
    const agent = await Agent.findById(id);
    
    if (!agent) {
      return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    }
    
    // Update all provided fields
    Object.keys(body).forEach(key => {
      agent[key] = body[key];
    });
    
    // Save with explicit commission values if provided
    await agent.save();
    
    // Log after save to verify data was saved correctly
    console.log('Agent updated successfully:', {
      id: agent._id,
      name: agent.name,
      agentComm: agent.agentCommissionPercentage,
      orgComm: agent.organizationCommissionPercentage
    });
    
    // Add cache control headers to prevent caching
    const response = NextResponse.json(agent.toObject(), { status: 200 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (err) {
    console.error('Error updating agent:', err);
    return NextResponse.json({ message: 'Failed to update agent' }, { status: 500 });
  }
}
