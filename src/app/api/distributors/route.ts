import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const distributors = await prisma.distributor.findMany({ 
      where: { deletedAt: null },
      orderBy: { name: 'asc' } 
    });
    return NextResponse.json({ success: true, data: distributors });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const distributor = await prisma.distributor.create({
      data: {
        code: data.code || `DL-${Date.now()}`,
        name: data.name,
        region: data.region,
        type: data.type || 'Cấp 1',
        contact: data.contact,
        phone: data.phone,
        status: data.status || 'active',
      }
    });
    return NextResponse.json({ success: true, data: distributor });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
