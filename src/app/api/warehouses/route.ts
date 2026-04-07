import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { inventoryItems: true } }
      }
    });

    const data = warehouses.map(w => ({
      id: w.id,
      name: w.name,
      code: w.code,
      address: w.address || '',
      itemCount: w._count.inventoryItems,
      capacity: w.capacity,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const warehouse = await prisma.warehouse.create({
      data: {
        code: data.code,
        name: data.name,
        address: data.address,
        capacity: parseFloat(data.capacity) || 1000,
      }
    });
    return NextResponse.json({ success: true, data: warehouse });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
