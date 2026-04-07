import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    const shipment = await prisma.shipment.update({
      where: { id },
      data: {
        salesOrderId: data.salesOrderId,
        driverId: data.driverId,
        status: data.status,
        address: data.address,
        customerName: data.customerName,
        estimatedDelivery: data.estimatedArrival ? new Date(data.estimatedArrival) : undefined,
      }
    });

    return NextResponse.json({ success: true, data: shipment });
  } catch (error) {
    console.error('Error updating shipment:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const shipment = await prisma.shipment.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: shipment });
  } catch (error) {
    console.error('Error soft deleting shipment:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
