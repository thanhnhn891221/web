import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { deletedAt: null };
    if (status && status !== 'all') where.status = status;

    const orders = await prisma.productionOrder.findMany({
      where,
      include: {
        line: { select: { name: true, manager: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const data = orders.map(o => ({
      ...o,
      lineName: o.line?.name,
      managerName: o.line?.manager
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Production Orders GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const count = await prisma.productionOrder.count();
    const code = `PROD-${String(count + 1).padStart(4, '0')}`;

    const order = await prisma.productionOrder.create({
      data: {
        code,
        productId: data.productId,
        productName: data.productName,
        quantity: data.quantity,
        unit: data.unit,
        lineId: data.lineId || null,
        priority: data.priority || 'medium',
        status: data.status || 'queued',
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
    });
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error('Production Orders POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
