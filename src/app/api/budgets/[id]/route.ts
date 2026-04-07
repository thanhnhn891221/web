import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        departmentName: data.departmentName,
        period: data.period,
        allocated: parseFloat(data.allocated),
        spent: parseFloat(data.spent),
        status: data.status,
      }
    });

    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const budget = await prisma.budget.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error('Error soft deleting budget:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
