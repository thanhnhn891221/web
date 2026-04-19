import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { deletedAt: null };
    if (status && status !== 'all') where.status = status;

    const boms = await prisma.billOfMaterial.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ success: true, data: boms });
  } catch (error) {
    console.error('BOM GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const count = await prisma.billOfMaterial.count();
    const code = `BOM-${String(count + 1).padStart(4, '0')}`;

    const bom = await prisma.billOfMaterial.create({
      data: {
        code,
        productName: data.productName,
        productSku: data.productSku,
        version: data.version || '1.0',
        note: data.note,
        items: data.items ? { create: data.items } : undefined,
      },
      include: { items: true },
    });
    return NextResponse.json({ success: true, data: bom }, { status: 201 });
  } catch (error) {
    console.error('BOM POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
