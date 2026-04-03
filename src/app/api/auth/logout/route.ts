// AIO.MS — Logout API
// POST /api/auth/logout

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Read JWT to log who's logging out
    const token = request.cookies.get('aio-token')?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        await prisma.auditLog.create({
          data: {
            userId: payload.userId,
            action: 'logout',
            module: 'CORE',
            target: `User ${payload.email}`,
            details: 'Đăng xuất',
          },
        });
      }
    }

    const response = NextResponse.json({ success: true });

    // Clear cookies
    response.cookies.set('aio-token', '', { maxAge: 0, path: '/' });
    response.cookies.set('aio-session', '', { maxAge: 0, path: '/' });

    return response;
  } catch {
    const response = NextResponse.json({ success: true });
    response.cookies.set('aio-token', '', { maxAge: 0, path: '/' });
    response.cookies.set('aio-session', '', { maxAge: 0, path: '/' });
    return response;
  }
}
