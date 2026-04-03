// AIO.MS — Login API
// POST /api/auth/login
// Authenticates user with email + password, returns JWT token

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { signToken, type JWTPayload } from '@/lib/auth';
import { comparePassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập email và mật khẩu' },
        { status: 400 }
      );
    }

    // Find user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { module: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản đã bị khóa. Liên hệ quản trị viên.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Aggregate roles
    const roles = user.userRoles.map((ur: any) => ({
      code: ur.role.code,
      name: ur.role.name,
    }));

    // Aggregate permissions from all roles (union of permissions)
    const permMap = new Map<string, JWTPayload['permissions'][0]>();
    for (const ur of user.userRoles) {
      for (const perm of ur.role.permissions) {
        const existing = permMap.get(perm.module.code);
        if (existing) {
          // Union: if ANY role grants access, user has access
          existing.canView = existing.canView || perm.canView;
          existing.canCreate = existing.canCreate || perm.canCreate;
          existing.canEdit = existing.canEdit || perm.canEdit;
          existing.canDelete = existing.canDelete || perm.canDelete;
        } else {
          permMap.set(perm.module.code, {
            moduleCode: perm.module.code,
            canView: perm.canView,
            canCreate: perm.canCreate,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete,
          });
        }
      }
    }
    const permissions = Array.from(permMap.values());

    // Create JWT
    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      roles,
      permissions,
    };

    const token = await signToken(jwtPayload);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'login',
        module: 'CORE',
        target: `User ${user.email}`,
        details: `Login thành công. Roles: ${roles.map((r: any) => r.code).join(', ')}`,
      },
    });

    // Set HttpOnly cookie + return user info
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        roles,
        permissions,
      },
    });

    response.cookies.set('aio-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Also set a non-HttpOnly cookie for client-side session info
    response.cookies.set('aio-session', JSON.stringify({
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      roles,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi hệ thống. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
