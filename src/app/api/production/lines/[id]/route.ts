import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const line = await prisma.productionLine.update({
      where: { id },
      data: {
        name: data.name,
        status: data.status,
        capacity: parseInt(data.capacity),
        manager: data.manager,
      }
    });

    return NextResponse.json({ success: true, data: line });
  } catch (error) {
    console.error('Error updating production line:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const line = await prisma.productionLine.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: line });
  } catch (error) {
    console.error('Error soft deleting production line:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
