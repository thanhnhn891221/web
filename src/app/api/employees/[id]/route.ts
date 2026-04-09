import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        sysRole: data.sysRole || null,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      }
    });

    // Sync Employee changes to matched User account (if exists by email)
    if (data.email) {
      try {
         const linkedUser = await prisma.user.findUnique({ where: { email: data.email } });
         if (linkedUser) {
            // Update the user's name if it differs
            if (linkedUser.name !== data.name) {
              await prisma.user.update({
                 where: { id: linkedUser.id },
                 data: { name: data.name }
              });
            }

            // Sync UserRoles if sysRole was provided
            if (data.sysRole) {
               const role = await prisma.role.findUnique({ where: { code: data.sysRole } });
               if (role) {
                  // Ensure this is the role assigned to the user
                  await prisma.userRole.deleteMany({
                    where: { userId: linkedUser.id }
                  });
                  await prisma.userRole.create({
                    data: {
                      userId: linkedUser.id,
                      roleId: role.id
                    }
                  });
               }
            }
         }
      } catch(e) {
         console.error("Failed to sync employee data to user account", e);
      }
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
