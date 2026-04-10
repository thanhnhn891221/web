import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('aio-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // SECURITY CHECK: Must have 'canManage' permission for HMS module
    const hasPermission = payload.permissions.some(p => p.moduleCode === 'HMS' && p.canManage);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Bạn không có quyền quản lý tài khoản (Mật khẩu)' }, { status: 403 });
    }

    const { action, password } = await request.json();

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!employee || !employee.userId) {
      return NextResponse.json({ error: 'Nhân viên này chưa có tài khoản hệ thống' }, { status: 404 });
    }

    if (action === 'lock') {
      await prisma.user.update({
        where: { id: employee.userId },
        data: { isActive: false }
      });
      return NextResponse.json({ success: true, message: 'Đã khóa tài khoản' });
    }

    if (action === 'unlock') {
      await prisma.user.update({
        where: { id: employee.userId },
        data: { isActive: true }
      });
      return NextResponse.json({ success: true, message: 'Đã mở khóa tài khoản' });
    }

    if (action === 'reset-password') {
      if (!password) return NextResponse.json({ error: 'Thiếu mật khẩu mới' }, { status: 400 });
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: employee.userId },
        data: { password: hashedPassword }
      });
      return NextResponse.json({ success: true, message: 'Đã cập nhật mật khẩu mới' });
    }

    return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });

  } catch (error) {
    console.error('Account Management Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
