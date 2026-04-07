import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const order = await prisma.salesOrder.update({
      where: { id },
      data: {
        customerId: data.customerId,
        totalAmount: parseFloat(data.totalAmount),
        status: data.status,
        channel: data.channel,
        note: data.note,
        expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery) : undefined,
      }
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Error updating sales order:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.salesOrder.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Error soft deleting sales order:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
