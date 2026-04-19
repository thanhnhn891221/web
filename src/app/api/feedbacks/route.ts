import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    const where: any = { deletedAt: null };
    if (customerId) where.customerId = customerId;
    if (status && status !== 'all') where.status = status;

    const feedbacks = await prisma.customerFeedback.findMany({
      where,
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ success: true, data: feedbacks });
  } catch (error) {
    console.error('Feedbacks GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const feedback = await prisma.customerFeedback.create({ data });
    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error) {
    console.error('Feedbacks POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
