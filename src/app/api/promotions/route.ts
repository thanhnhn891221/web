import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { deletedAt: null };
    if (status && status !== 'all') where.status = status;

    const promotions = await prisma.promotion.findMany({
      where,
      include: { vouchers: { select: { id: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const data = promotions.map(p => ({
      ...p,
      voucherCount: p.vouchers.length,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Promotions GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const promo = await prisma.promotion.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type || 'percent',
        value: data.value || 0,
        minOrderAmount: data.minOrderAmount || 0,
        maxDiscount: data.maxDiscount,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        usageLimit: data.usageLimit,
        perCustomerLimit: data.perCustomerLimit || 1,
        applicableProducts: data.applicableProducts,
      },
    });
    return NextResponse.json({ success: true, data: promo }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Mã khuyến mãi đã tồn tại' }, { status: 409 });
    }
    console.error('Promotions POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
