import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MODULES } from '@/lib/modules';

const prisma = new PrismaClient();

/**
 * Auto-sync: Ensure every module in the frontend registry also exists in DB.
 * Uses upsert so it never duplicates and always keeps data fresh.
 */
async function autoSyncModules() {
  for (const mod of MODULES) {
    await prisma.module.upsert({
      where: { code: mod.code },
      update: { 
        name: mod.name, 
        nameVi: mod.nameVi,
        groupCode: mod.group,
        icon: mod.icon,
        color: mod.color,
        href: mod.href,
        orderIndex: mod.order 
      },
      create: {
        code: mod.code,
        name: mod.name,
        nameVi: mod.nameVi,
        groupCode: mod.group,
        icon: mod.icon,
        color: mod.color,
        href: mod.href,
        orderIndex: mod.order,
      },
    });
  }
}

export async function GET(request: Request) {
  try {
    // Auto-sync modules from frontend registry to DB on every load
    await autoSyncModules();

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

    await prisma.$transaction(async (tx) => {
      await tx.roleModulePermission.deleteMany({
        where: { roleId }
      });

      if (permissions.length > 0) {
        const dataToInsert = permissions.map((p: any) => ({
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
