import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const where: any = { deletedAt: null };
    if (type && type !== 'all') where.type = type;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const flows = await prisma.cashFlow.findMany({
      where,
      include: { accountingEntry: { select: { code: true } } },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 300,
    });

    const totalReceipts = flows.filter(f => f.type === 'receipt').reduce((s, f) => s + f.amount, 0);
    const totalPayments = flows.filter(f => f.type === 'payment').reduce((s, f) => s + f.amount, 0);

    return NextResponse.json({
      success: true, data: flows,
      summary: { totalReceipts, totalPayments, netCash: totalReceipts - totalPayments, count: flows.length },
    });
  } catch (error) {
    console.error('Cash Flows GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const count = await prisma.cashFlow.count();
    const prefix = data.type === 'receipt' ? 'PT' : 'PC';
    const code = `${prefix}-${String(count + 1).padStart(4, '0')}`;

    const flow = await prisma.cashFlow.create({
      data: {
        code,
        type: data.type,
        category: data.category,
        amount: data.amount || 0,
        paymentMethod: data.paymentMethod || 'cash',
        bankAccount: data.bankAccount,
        counterpartyName: data.counterpartyName,
        counterpartyId: data.counterpartyId,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
        note: data.note,
      },
    });
    return NextResponse.json({ success: true, data: flow }, { status: 201 });
  } catch (error) {
    console.error('Cash Flows POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
