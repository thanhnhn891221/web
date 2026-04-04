import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const orders = await prisma.salesOrder.findMany({
      include: {
        customer: true,
        items: true,
        shipments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedData = orders.map(o => ({
      ...o,
      customerName: o.customer.name,
      itemsCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
    }));

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
