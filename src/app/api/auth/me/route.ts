// AIO.MS — Get Current User API
// GET /api/auth/me

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

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

    return NextResponse.json({
      success: true,
      data: {
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
        roles: payload.roles,
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
