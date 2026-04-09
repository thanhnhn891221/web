import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('aio-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Chưa đăng nhập' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Phiên đăng nhập hết hạn' },
        { status: 401 }
      );
    }

    // Query database for fresh user info
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        userRoles: {
          include: { role: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    // Connect to employee
    const employee = await prisma.employee.findFirst({
      where: { email: user.email },
      include: { department: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        employee: employee ? {
           code: employee.employeeCode,
           department: employee.department?.name,
           position: employee.position,
           status: employee.status,
           level: employee.level
        } : null,
        roles: user.userRoles.map((r: any) => ({
           id: r.role.id,
           code: r.role.code,
           name: r.role.name
        })),
        permissions: payload.permissions, // Permissions can remain from token for this purpose, or refetch
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
