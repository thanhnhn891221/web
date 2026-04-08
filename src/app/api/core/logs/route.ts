import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count()
    ]);

    return NextResponse.json({ success: true, data: logs, total, page, limit });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi server' },
      { status: 500 }
    );
  }
}
