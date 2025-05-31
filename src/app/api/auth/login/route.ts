import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Agent from '@/models/Agent';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  await dbConnect();
  const { email, password } = await req.json();

  const agent = await Agent.findOne({ email });
  if (!agent || !agent.password) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, agent.password);
  if (!isMatch) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const token = await signJwt({ id: agent._id.toString(), role: 'agent' });


 // ✅ Set cookie properly
  const res = NextResponse.json({ message: 'Login successful' })
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  console.log('Login successful for agent:', agent._id.toString());
  return res;

}
