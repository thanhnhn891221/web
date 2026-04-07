import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    // Find dept ID if name is provided
    let departmentId = undefined;
    if (data.department) {
      const dept = await prisma.department.findFirst({
        where: { name: data.department }
      });
      departmentId = dept?.id;
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        departmentId: departmentId,
        position: data.position,
        level: data.level,
        status: data.status,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      }
    });

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const employee = await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error soft deleting employee:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
