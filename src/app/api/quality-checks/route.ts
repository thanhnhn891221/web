import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const checks = await prisma.qualityCheck.findMany({
      where: { deletedAt: null },
      include: { criteria: true },
      orderBy: { checkedAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: checks });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const check = await prisma.qualityCheck.create({
      data: {
        code: data.code || `QC-${Date.now()}`,
        product: data.product,
        batch: data.batch,
        type: data.type || 'final',
        inspector: data.inspector || 'Admin',
        result: data.result || 'pending',
        defectRate: data.defectRate || 0,
        note: data.note,
        criteria: {
          create: data.criteria?.map((c: any) => ({
            name: c.name,
            standard: c.standard,
            actual: c.actual,
            pass: c.pass
          }))
        }
      },
      include: { criteria: true }
    });
    return NextResponse.json({ success: true, data: check });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
