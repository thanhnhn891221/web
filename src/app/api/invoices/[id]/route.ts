import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        salesOrderId: data.salesOrderId,
        customerId: data.customerId,
        customerName: data.customerName,
        amount: parseFloat(data.amount),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status,
      }
    });

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error soft deleting invoice:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
