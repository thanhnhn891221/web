import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const where: any = { deletedAt: null };
    if (type && type !== 'all') where.type = type;
    if (status && status !== 'all') where.status = status;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const entries = await prisma.accountingEntry.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 300,
    });

    const totalDebit = entries.reduce((s, e) => s + e.amount, 0);

    return NextResponse.json({ success: true, data: entries, summary: { total: entries.length, totalDebit } });
  } catch (error) {
    console.error('Accounting Entries GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const count = await prisma.accountingEntry.count();
    const code = `AE-${String(count + 1).padStart(4, '0')}`;

    const entry = await prisma.accountingEntry.create({
      data: {
        code,
        date: data.date ? new Date(data.date) : new Date(),
        type: data.type || 'general',
        accountDebit: data.accountDebit,
        accountCredit: data.accountCredit,
        amount: data.amount || 0,
        description: data.description,
        refType: data.refType,
        refId: data.refId,
        refCode: data.refCode,
        currency: data.currency || 'VND',
        note: data.note,
      },
    });
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error('Accounting Entries POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
