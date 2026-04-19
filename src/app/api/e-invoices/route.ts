import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { deletedAt: null };
    if (status && status !== 'all') where.status = status;

    const invoices = await prisma.eInvoice.findMany({
      where,
      include: { invoice: { select: { code: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error('E-Invoices GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const eInvoice = await prisma.eInvoice.create({ data });
    return NextResponse.json({ success: true, data: eInvoice }, { status: 201 });
  } catch (error) {
    console.error('E-Invoices POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
