import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const shipments = await prisma.shipment.findMany({
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
  } finally {
    await prisma.$disconnect();
  }
}
