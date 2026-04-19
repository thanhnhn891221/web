import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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
      sysRole: emp.sysRole || '',
      hasAccount: !!emp.userId,
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
    const { password, ...empData } = data;

    // 1. Get dept ID from name (since frontend sends name)
    const dept = await prisma.department.findFirst({
      where: { name: empData.department }
    });

    // 2. Prepare user creation if password is provided
    let userId: string | null = null;
    if (password && empData.email) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email: empData.email,
          name: empData.name,
          password: hashedPassword,
          isActive: true,
        }
      });
      userId = user.id;

      // Assign initial role to user
      if (empData.sysRole) {
        const role = await prisma.role.findUnique({ where: { code: empData.sysRole } });
        if (role) {
          await prisma.userRole.create({
            data: {
              userId: user.id,
              roleId: role.id
            }
          });
        }
      }
    }

    const employee = await prisma.employee.create({
      data: {
        employeeCode: `NV-${Math.floor(Math.random() * 900) + 100}`,
        fullName: empData.name,
        email: empData.email,
        phone: empData.phone,
        departmentId: dept?.id || '',
        position: empData.position,
        level: empData.level,
        status: empData.status,
        sysRole: empData.sysRole || null,
        hireDate: new Date(empData.hireDate),
        userId: userId
      }
    });

    // If user already existed (not created just now) but need to sync
    if (!userId && empData.email) {
      try {
         const linkedUser = await prisma.user.findUnique({ where: { email: empData.email } });
         if (linkedUser) {
            await prisma.employee.update({
              where: { id: employee.id },
              data: { userId: linkedUser.id }
            });
            // ... (sync logic for existing user)
            if (linkedUser.name !== empData.name) {
              await prisma.user.update({ where: { id: linkedUser.id }, data: { name: empData.name } });
            }
         }
      } catch(e) {
         console.error("Failed to sync existing user account", e);
      }
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
