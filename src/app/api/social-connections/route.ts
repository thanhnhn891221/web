import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connections = await prisma.socialConnection.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: connections });
  } catch (error) {
    console.error('Social Connections GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const connection = await prisma.socialConnection.create({ data });
    return NextResponse.json({ success: true, data: connection }, { status: 201 });
  } catch (error) {
    console.error('Social Connections POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
