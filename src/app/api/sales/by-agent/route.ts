import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sale from '@/models/Sale';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyJwt(token);
  if (!decoded || !decoded.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sales = await Sale.find({ agentId: decoded.id })
      .sort({ saleDate: -1 })
      .lean();
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching agent sales:', error);
    return NextResponse.json({ message: 'Failed to fetch sales' }, { status: 500 });
  }
}
