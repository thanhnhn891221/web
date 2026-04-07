import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        capacity: parseFloat(data.capacity),
        status: data.status,
      }
    });

    return NextResponse.json({ success: true, data: warehouse });
  } catch (error) {
    console.error('Error updating warehouse:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: warehouse });
  } catch (error) {
    console.error('Error soft deleting warehouse:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
