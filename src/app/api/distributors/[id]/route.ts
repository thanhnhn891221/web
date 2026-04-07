import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const distributor = await prisma.distributor.update({
      where: { id },
      data: {
        name: data.name,
        region: data.region,
        type: data.type,
        contact: data.contact,
        phone: data.phone,
        status: data.status,
      }
    });

    return NextResponse.json({ success: true, data: distributor });
  } catch (error) {
    console.error('Error updating distributor:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const distributor = await prisma.distributor.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: distributor });
  } catch (error) {
    console.error('Error soft deleting distributor:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
