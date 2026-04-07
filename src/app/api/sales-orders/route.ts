import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.salesOrder.findMany({
      where: { deletedAt: null },
      include: {
        customer: true,
        items: true,
        shipments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const data = orders.map(o => ({
      ...o,
      customerName: o.customer.name,
      itemsCount: o.items.length,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const order = await prisma.salesOrder.create({
      data: {
        code: data.code || `SO-${Date.now()}`,
        customerId: data.customerId,
        totalAmount: parseFloat(data.totalAmount) || 0,
        status: data.status || 'pending',
        items: {
          create: data.items?.map((item: any) => ({
            productName: item.name,
            quantity: parseFloat(item.qty),
            unit: item.unit || 'Pc',
            unitPrice: parseFloat(item.price),
            totalPrice: parseFloat(item.qty) * parseFloat(item.price)
          }))
        }
      },
      include: { items: true }
    });
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
