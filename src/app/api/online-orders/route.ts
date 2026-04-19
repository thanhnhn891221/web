import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');

    const where: any = { deletedAt: null };
    if (status && status !== 'all') where.status = status;
    if (platform && platform !== 'all') where.platform = platform;

    const orders = await prisma.onlineOrder.findMany({
      where,
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const data = orders.map(o => ({
      ...o,
      customerName: o.customer?.name || o.customerName,
      createdAt: o.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Online Orders GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const count = await prisma.onlineOrder.count();
    const code = `ONL-${String(count + 1).padStart(4, '0')}`;

    const order = await prisma.onlineOrder.create({
      data: { code, ...data },
    });
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error('Online Orders POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
