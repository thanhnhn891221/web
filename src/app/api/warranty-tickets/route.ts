import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { deletedAt: null };
    if (status && status !== 'all') where.status = status;

    const tickets = await prisma.warrantyTicket.findMany({
      where,
      include: {
        customer: { select: { name: true } },
        policy: { select: { name: true, durationMonths: true } },
        process: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const stats = {
      total: tickets.length,
      received: tickets.filter(t => t.status === 'received').length,
      diagnosing: tickets.filter(t => t.status === 'diagnosing').length,
      repairing: tickets.filter(t => t.status === 'repairing').length,
      completed: tickets.filter(t => t.status === 'completed').length,
    };

    return NextResponse.json({ success: true, data: tickets, stats });
  } catch (error) {
    console.error('Warranty Tickets GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const count = await prisma.warrantyTicket.count();
    const code = `WRT-${String(count + 1).padStart(4, '0')}`;

    const ticket = await prisma.warrantyTicket.create({
      data: {
        code,
        customerId: data.customerId || null,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        productName: data.productName,
        productSerial: data.productSerial,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        policyId: data.policyId || null,
        issue: data.issue,
        isUnderWarranty: data.isUnderWarranty ?? true,
        assignedTo: data.assignedTo,
      },
    });
    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error) {
    console.error('Warranty Tickets POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
