import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        description: data.description,
        date: data.date ? new Date(data.date) : undefined,
        account: data.account,
        debit: parseFloat(data.debit),
        credit: parseFloat(data.credit),
        type: data.type,
      }
    });

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transaction = await prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error soft deleting transaction:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
