import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const driver = await prisma.driver.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        vehicle: data.vehicle,
        licensePlate: data.licensePlate,
        status: data.status,
      }
    });

    return NextResponse.json({ success: true, data: driver });
  } catch (error) {
    console.error('Error updating driver:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const driver = await prisma.driver.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: driver });
  } catch (error) {
    console.error('Error soft deleting driver:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
