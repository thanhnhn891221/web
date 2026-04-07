import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const lines = await prisma.productionLine.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: lines });
  } catch (error) {
    console.error('Error fetching production lines:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const line = await prisma.productionLine.create({
      data: {
        name: data.name,
        code: data.code,
        status: data.status || 'idle',
        capacity: parseInt(data.capacity) || 0,
        manager: data.manager,
      }
    });
    return NextResponse.json({ success: true, data: line });
  } catch (error) {
    console.error('Error creating production line:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
