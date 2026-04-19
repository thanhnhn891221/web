import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/attendances — Danh sách chấm công
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status && status !== 'all') where.status = status;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: { select: { employeeCode: true, fullName: true, department: { select: { name: true } } } },
        shift: { select: { code: true, name: true } },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 500,
    });

    const data = attendances.map(a => ({
      id: a.id,
      employeeId: a.employeeId,
      employeeCode: a.employee.employeeCode,
      employeeName: a.employee.fullName,
      department: a.employee.department.name,
      shiftId: a.shiftId,
      shiftName: a.shift?.name || '-',
      date: a.date.toISOString().split('T')[0],
      checkIn: a.checkIn?.toISOString() || null,
      checkOut: a.checkOut?.toISOString() || null,
      checkInMethod: a.checkInMethod,
      workingHours: a.workingHours,
      overtimeHours: a.overtimeHours,
      status: a.status,
      note: a.note,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Attendances GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/attendances — Chấm công
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: data.employeeId,
        shiftId: data.shiftId || null,
        date: new Date(data.date),
        checkIn: data.checkIn ? new Date(data.checkIn) : null,
        checkOut: data.checkOut ? new Date(data.checkOut) : null,
        checkInMethod: data.checkInMethod || 'manual',
        workingHours: data.workingHours || 0,
        overtimeHours: data.overtimeHours || 0,
        status: data.status || 'present',
        note: data.note || null,
      },
    });

    return NextResponse.json({ success: true, data: attendance }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Nhân viên đã có bản chấm công cho ngày này' }, { status: 409 });
    }
    console.error('Attendances POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
