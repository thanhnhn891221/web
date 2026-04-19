import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PUT /api/leave-requests/[id] — Cập nhật / phê duyệt đơn nghỉ phép
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.approvedBy) updateData.approvedBy = data.approvedBy;
    if (data.status === 'approved') updateData.approvedAt = new Date();
    if (data.rejectReason) updateData.rejectReason = data.rejectReason;

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: leave });
  } catch (error) {
    console.error('LeaveRequest PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/leave-requests/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.leaveRequest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('LeaveRequest DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
