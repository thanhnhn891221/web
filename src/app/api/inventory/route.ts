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

    const dbInventory = await prisma.inventoryItem.findMany({
      where: { deletedAt: null },
      include: {
        warehouse: true,
      },
      orderBy: { sku: 'asc' }
    });

    const inventory = dbInventory.map(item => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      category: item.category || 'Mặc định',
      warehouseId: item.warehouseId,
      warehouseName: item.warehouse?.name || 'Không xác định',
      zone: item.zone || '-',
      quantity: item.quantity,
      minStock: item.minStock,
      unit: item.unit,
      lastUpdated: item.lastUpdated.toISOString().split('T')[0],
      status: item.status,
    }));

    return NextResponse.json({ success: true, count: inventory.length, data: inventory });
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const item = await prisma.inventoryItem.create({
      data: {
        sku: data.sku || `SKU-${Date.now()}`,
        name: data.name,
        category: data.category,
        warehouseId: data.warehouseId,
        zone: data.zone,
        quantity: parseFloat(data.quantity) || 0,
        minStock: parseFloat(data.minStock) || 0,
        unit: data.unit || 'Kg',
        status: data.status || 'in_stock',
      }
    });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
