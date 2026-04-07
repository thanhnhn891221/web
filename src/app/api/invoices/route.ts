import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { deletedAt: null },
      include: { customer: true, salesOrder: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Invoices fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const invoice = await prisma.invoice.create({
      data: {
        code: data.code || `INV-${Date.now()}`,
        salesOrderId: data.salesOrderId,
        customerId: data.customerId,
        customerName: data.customerName || 'Khách hàng lẻ',
        amount: parseFloat(data.amount) || 0,
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
        status: data.status || 'unpaid',
      }
    });
    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
