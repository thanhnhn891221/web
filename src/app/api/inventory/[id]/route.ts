import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        warehouseId: data.warehouseId,
        zone: data.zone,
        quantity: parseFloat(data.quantity),
        minStock: parseFloat(data.minStock),
        unit: data.unit,
        status: data.status,
      }
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error soft deleting inventory item:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
