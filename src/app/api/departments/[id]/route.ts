import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const dept = await prisma.department.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
      }
    });

    return NextResponse.json({ success: true, data: dept });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if department has active employees
    const empCount = await prisma.employee.count({
      where: { departmentId: id, deletedAt: null }
    });

    if (empCount > 0) {
      return NextResponse.json({ 
        error: `Không thể xóa phòng ban đang có ${empCount} nhân viên hoạt động.` 
      }, { status: 400 });
    }

    const dept = await prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: dept });
  } catch (error) {
    console.error('Error soft deleting department:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
