import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Agent from '@/models/Agent';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    await Agent.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Agent deleted' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: 'Failed to delete agent' }, { status: 500 });
  }
}
