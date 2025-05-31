import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sale from '@/models/Sale';
import { verifyJwt } from '@/lib/jwt';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

// Get a single sale
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const id = params.id;
  
  try {
    // Verify auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the sale
    const sale = await Sale.findById(id).lean();
    
    if (!sale) {
      return NextResponse.json({ message: 'Sale not found' }, { status: 404 });
    }
    
    return NextResponse.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    return NextResponse.json({ message: 'Failed to fetch sale' }, { status: 500 });
  }
}

// Update a sale
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    // Verify auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    const body = await req.json();
    
    // Get the original sale to calculate difference in amount
    const originalSale = await Sale.findById(id);
    if (!originalSale) {
      return NextResponse.json({ message: 'Sale not found' }, { status: 404 });
    }
    
    // Calculate the difference in amount for agent update
    const amountDifference = body.amount - originalSale.amount;
    
    // Update the sale
    const updatedSale = await Sale.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    // Update agent's total sales with the difference in amount
    if (amountDifference !== 0) {
      const Agent = mongoose.models.Agent || mongoose.model('Agent');
      await Agent.findByIdAndUpdate(
        body.agentId,
        { $inc: { totalSales: amountDifference } },
        { new: true }
      );
    }
    
    console.log('Sale updated:', updatedSale);
    
    // Add cache control headers
    const response = NextResponse.json(updatedSale);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json({ message: 'Failed to update sale' }, { status: 500 });
  }
}

// Delete a sale
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    // Verify auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    // Get the sale to be deleted for agent update
    const saleToDelete = await Sale.findById(id);
    if (!saleToDelete) {
      return NextResponse.json({ message: 'Sale not found' }, { status: 404 });
    }
    
    // Delete the sale
    const deletedSale = await Sale.findByIdAndDelete(id);
    
    // Update agent's total sales by subtracting the sale amount
    if (saleToDelete.agentId) {
      const Agent = mongoose.models.Agent || mongoose.model('Agent');
      await Agent.findByIdAndUpdate(
        saleToDelete.agentId,
        { $inc: { totalSales: -saleToDelete.amount } },
        { new: true }
      );
    }
    
    return NextResponse.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json({ message: 'Failed to delete sale' }, { status: 500 });
  }
}