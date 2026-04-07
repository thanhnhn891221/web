import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        supplierId: data.supplierId,
        totalAmount: parseFloat(data.amount) || parseFloat(data.totalAmount),
        status: data.status,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        note: data.note,
      }
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Error updating purchase order:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Error soft deleting purchase order:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
