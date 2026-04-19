import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const where: any = { deletedAt: null };
    if (status && status !== 'all') where.status = status;

    const orders = await prisma.dealerOrder.findMany({
      where,
      include: {
        distributor: { select: { name: true, code: true } },
        policy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Dealer Orders GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const count = await prisma.dealerOrder.count();
    const code = `DLR-${String(count + 1).padStart(4, '0')}`;

    const order = await prisma.dealerOrder.create({
      data: { code, ...data },
    });
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error('Dealer Orders POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
