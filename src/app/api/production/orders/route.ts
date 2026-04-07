import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.productionOrder.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const order = await prisma.productionOrder.create({
      data: {
        code: data.code || `LSX-${Date.now()}`,
        productName: data.productName,
        quantity: parseInt(data.quantity) || 0,
        unit: data.unit || 'Kg',
        status: data.status || 'queued',
        deadline: data.startDate ? new Date(data.startDate) : null,
      }
    });
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
