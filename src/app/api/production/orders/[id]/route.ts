import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    const order = await prisma.productionOrder.update({
      where: { id },
      data: {
        productName: data.productName,
        quantity: parseInt(data.quantity),
        unit: data.unit,
        status: data.status,
        deadline: data.startDate ? new Date(data.startDate) : undefined,
      }
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Error updating production order:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const order = await prisma.productionOrder.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Error soft deleting production order:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
