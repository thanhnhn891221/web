import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const assets = await prisma.iTAsset.findMany({ 
      where: { deletedAt: null },
      orderBy: { code: 'asc' } 
    });
    return NextResponse.json({ success: true, data: assets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const asset = await prisma.iTAsset.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        status: data.status || 'active',
        location: data.location,
        assignedTo: data.assignedTo,
      }
    });
    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}
