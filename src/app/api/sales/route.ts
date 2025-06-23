import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sale from '@/models/Sale';
import { verifyJwt } from '@/lib/jwt';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

// Get all sales
export async function GET(req: NextRequest) {
  await dbConnect();
  
  try {
    // Verify auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all sales, sort by date descending
    const sales = await Sale.find({}).sort({ saleDate: -1 }).populate('agentId', 'name email').lean();
    
    // Add cache control headers
    const response = NextResponse.json(sales);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return response;
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ message: 'Failed to fetch sales' }, { status: 500 });
  }
}

// Create a new sale
export async function POST(req: NextRequest) {
  await dbConnect();
  
  try {
    // Verify auth token
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    console.log('Creating sale with data:', body);
    
    // Ensure description field has a value
    if (!body.description) {
      body.description = body.productName || '';
    }
    
    // Create new sale
    const newSale = await Sale.create(body);
    
    // Update the agent's totalSales field
    if (body.agentId) {
      const Agent = mongoose.models.Agent || mongoose.model('Agent');
      await Agent.findByIdAndUpdate(
        body.agentId,
        { $inc: { totalSales: body.amount } },
        { new: true }
      );
    }
    
    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ message: 'Failed to create sale' }, { status: 500 });
  }
}
