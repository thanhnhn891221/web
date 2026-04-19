import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/shifts — Danh sách ca làm
export async function GET() {
  try {
    const shifts = await prisma.workShift.findMany({
      where: { deletedAt: null },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json({ success: true, data: shifts });
  } catch (error) {
    console.error('Shifts GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/shifts — Tạo ca làm mới
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const shift = await prisma.workShift.create({
      data: {
        code: data.code,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        breakMinutes: data.breakMinutes || 60,
        workingHours: data.workingHours || 8,
        color: data.color || '#3B82F6',
        isOvernight: data.isOvernight || false,
      },
    });

    return NextResponse.json({ success: true, data: shift }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Mã ca làm đã tồn tại' }, { status: 409 });
    }
    console.error('Shifts POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
