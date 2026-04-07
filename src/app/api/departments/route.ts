import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const departments = await prisma.department.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        _count: {
          select: { employees: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const data = departments.map(d => ({
      id: d.id,
      name: d.name,
      code: d.code,
      employeeCount: d._count.employees,
      color: 'var(--primary-500)'
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const dept = await prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
      }
    });

    return NextResponse.json({ success: true, data: dept });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
