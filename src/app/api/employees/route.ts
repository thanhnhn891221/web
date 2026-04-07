import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const token = request.cookies.get('aio-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Auth validation
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. Fetch employees from DB
    const dbEmployees = await prisma.employee.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        department: true,
      },
      orderBy: {
        employeeCode: 'asc'
      }
    });

    // 3. Map to Frontend EmployeeData Interface format
    const employees = dbEmployees.map(emp => ({
      id: emp.id,
      code: emp.employeeCode,
      name: emp.fullName,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department?.name || 'Không xác định',
      position: emp.position,
      level: emp.level || 'junior',
      status: emp.status,
      // Handle timezone safety for dates
      hireDate: emp.hireDate.toISOString().split('T')[0],
    }));

    // Generate summary metrics
    const stats = {
      total: employees.length,
      probation: employees.filter(e => e.status === 'probation').length,
    };

    return NextResponse.json({ success: true, count: employees.length, data: employees, stats });

  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // 1. Get dept ID from name (since frontend sends name)
    const dept = await prisma.department.findFirst({
      where: { name: data.department }
    });

    const employee = await prisma.employee.create({
      data: {
        employeeCode: `NV-${Math.floor(Math.random() * 900) + 100}`, // Simple generator for now
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        departmentId: dept?.id || '',
        position: data.position,
        level: data.level,
        status: data.status,
        hireDate: new Date(data.hireDate),
      }
    });

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
