import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            module: true
          }
        }
      },
      orderBy: { code: 'asc' }
    });
    
    // Also fetch all available modules so frontend can map them if missing
    const allModules = await prisma.module.findMany({
      orderBy: { orderIndex: 'asc' }
    });

    return NextResponse.json({ success: true, data: { roles, allModules } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi server' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { roleId, permissions } = body;

    if (!roleId || !Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, error: 'Thiếu roleId hoặc array permissions' },
        { status: 400 }
      );
    }

    // Wrap in transaction: replace all permissions for this role
    await prisma.$transaction(async (tx) => {
      // 1. Delete old permissions for this role
      await tx.roleModulePermission.deleteMany({
        where: { roleId }
      });

      // 2. Insert new permissions safely
      if (permissions.length > 0) {
        const dataToInsert = permissions.map(p => ({
          roleId,
          moduleId: p.moduleId,
          canView: Boolean(p.canView),
          canCreate: Boolean(p.canCreate),
          canEdit: Boolean(p.canEdit),
          canDelete: Boolean(p.canDelete)
        }));

        await tx.roleModulePermission.createMany({
          data: dataToInsert
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Cập nhật phân quyền thành công' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi lưu trữ quyền' },
      { status: 500 }
    );
  }
}
