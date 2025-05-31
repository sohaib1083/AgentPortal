import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Agent from '@/models/Agent';
import { signJwt } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find the agent by email - don't use .lean() here!
    const agent = await Agent.findOne({ email });

    if (!agent) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // If agent exists but comparePassword is not available, use direct bcrypt comparison
    let isMatch;

    if (typeof agent.comparePassword === 'function') {
      // Use the model method if available
      isMatch = await agent.comparePassword(password);
    } else {
      // Fallback to direct comparison
      isMatch = await bcrypt.compare(password, agent.password);
    }

    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create token with ID as string
    const token = await signJwt({
      id: agent._id.toString(), // Explicitly convert to string
      role: 'agent',
    });

    // Create response with token cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        level: agent.level,
      },
    });

    // Set the cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
