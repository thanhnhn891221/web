import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const asset = await prisma.iTAsset.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        status: data.status,
        location: data.location,
        assignedTo: data.assignedTo,
      }
    });

    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    console.error('Error updating IT asset:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const asset = await prisma.iTAsset.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    console.error('Error soft deleting IT asset:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
