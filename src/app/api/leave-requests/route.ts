import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/leave-requests — Danh sách nghỉ phép
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    const where: any = { deletedAt: null };
    if (employeeId) where.employeeId = employeeId;
    if (status && status !== 'all') where.status = status;

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: { select: { employeeCode: true, fullName: true, department: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const data = leaves.map(l => ({
      id: l.id,
      code: l.code,
      employeeId: l.employeeId,
      employeeCode: l.employee.employeeCode,
      employeeName: l.employee.fullName,
      department: l.employee.department.name,
      type: l.type,
      startDate: l.startDate.toISOString().split('T')[0],
      endDate: l.endDate.toISOString().split('T')[0],
      totalDays: l.totalDays,
      reason: l.reason,
      status: l.status,
      approvedBy: l.approvedBy,
      approvedAt: l.approvedAt?.toISOString() || null,
      rejectReason: l.rejectReason,
      createdAt: l.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('LeaveRequests GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/leave-requests — Tạo đơn nghỉ phép
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Auto-generate code
    const count = await prisma.leaveRequest.count();
    const code = `LR-${String(count + 1).padStart(4, '0')}`;

    // Calculate total days
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = await prisma.leaveRequest.create({
      data: {
        code,
        employeeId: data.employeeId,
        type: data.type || 'annual',
        startDate: start,
        endDate: end,
        totalDays: data.totalDays || totalDays,
        reason: data.reason || null,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, data: leave }, { status: 201 });
  } catch (error) {
    console.error('LeaveRequests POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
