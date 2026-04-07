import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const shipments = await prisma.shipment.findMany({
      where: { deletedAt: null },
      include: {
        salesOrder: true,
        driver: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedShipments = shipments.map(s => ({
      ...s,
      orderCode: s.salesOrder?.code || 'Tiêu chuẩn',
      driverName: s.driver?.name || 'Chưa phân công',
      driverPhone: s.driver?.phone || 'N/A',
      vehicle: s.driver?.vehicle || 'N/A',
    }));

    return NextResponse.json({ success: true, data: formattedShipments });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const shipment = await prisma.shipment.create({
      data: {
        code: data.code || `SHIP-${Date.now()}`,
        salesOrderId: data.salesOrderId,
        driverId: data.driverId,
        status: data.status || 'pending',
        customerName: data.customerName || 'Khách hàng lẻ',
        address: data.address || '',
        estimatedDelivery: data.estimatedArrival ? new Date(data.estimatedArrival) : null,
      }
    });
    return NextResponse.json({ success: true, data: shipment });
  } catch (error) {
    console.error('Error creating shipment:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
