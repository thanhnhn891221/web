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

    // Query database for fresh user info with full role+permission detail
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    module: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    // Connect to employee
    const employee = await prisma.employee.findFirst({
      where: { 
         email: { equals: user.email, mode: 'insensitive' }
      },
      include: { department: true }
    });

    // Build roles array with their detailed permissions
    const roles = user.userRoles.map((ur: any) => ({
      id: ur.role.id,
      code: ur.role.code,
      name: ur.role.name,
      permissions: ur.role.permissions.map((p: any) => ({
        moduleCode: p.module.code,
        moduleName: p.module.name,
        canView: p.canView,
        canCreate: p.canCreate,
        canEdit: p.canEdit,
        canDelete: p.canDelete,
        canManage: p.canManage,
      }))
    }));

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
        roles,
        permissions: payload.permissions,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
