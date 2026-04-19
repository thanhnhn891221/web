import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const storeId = searchParams.get('storeId');

    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (storeId) where.storeId = storeId;

    const sessions = await prisma.pOSSession.findMany({
      where,
      include: {
        employee: { select: { employeeCode: true, fullName: true } },
        transactions: { select: { id: true, total: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const data = sessions.map(s => ({
      id: s.id,
      code: s.code,
      employeeName: s.employee.fullName,
      employeeCode: s.employee.employeeCode,
      openedAt: s.openedAt.toISOString(),
      closedAt: s.closedAt?.toISOString() || null,
      openingBalance: s.openingBalance,
      closingBalance: s.closingBalance,
      totalSales: s.totalSales,
      totalTransactions: s.transactions.length,
      status: s.status,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('POS Sessions GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const count = await prisma.pOSSession.count();
    const code = `POS-${String(count + 1).padStart(4, '0')}`;

    const session = await prisma.pOSSession.create({
      data: { code, employeeId: data.employeeId, openingBalance: data.openingBalance || 0, storeId: data.storeId },
    });
    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error) {
    console.error('POS Sessions POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
