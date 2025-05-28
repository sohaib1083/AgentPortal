import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Agent from '@/models/Agent';
import bcrypt from 'bcryptjs';

export async function GET() {
  await dbConnect();
  const agents = await Agent.find({});
  return NextResponse.json(agents);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  try {
    // Check if agent with email already exists
    const existing = await Agent.findOne({ email: body.email });
    if (existing) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash('Abcd@1234', 10);
    const agent = await Agent.create({ ...body, password: hashedPassword });

    return NextResponse.json(agent, { status: 201 });

  } catch (err) {
    return NextResponse.json({ message: 'Failed to create agent' }, { status: 500 });
  }
}
