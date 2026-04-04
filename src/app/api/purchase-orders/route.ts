import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('aio-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const dbOrders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const orders = dbOrders.map(order => ({
      id: order.id,
      code: order.code,
      supplierId: order.supplierId,
      supplierName: order.supplier?.name || 'Không xác định',
      items: order.items.map(i => ({ name: i.itemName, qty: i.quantity, unit: i.unit, price: i.unitPrice })),
      totalAmount: order.totalAmount,
      status: order.status,
      // Fallback createdBy for now
      createdBy: 'Hệ thống',
      createdAt: order.createdAt.toISOString().split('T')[0],
      expectedDate: order.expectedDate ? order.expectedDate.toISOString().split('T')[0] : 'N/A',
      note: order.note || '',
    }));

    return NextResponse.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
