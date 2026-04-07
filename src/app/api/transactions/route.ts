import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { deletedAt: null },
      orderBy: { date: 'desc' },
      take: 100,
    });
    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const transaction = await prisma.transaction.create({
      data: {
        code: data.code || `TRX-${Date.now()}`,
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description,
        account: data.account || 'Tiền mặt',
        debit: parseFloat(data.debit) || 0,
        credit: parseFloat(data.credit) || 0,
        type: data.type || 'revenue',
      }
    });
    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Transaction creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
