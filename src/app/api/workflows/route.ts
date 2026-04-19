import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const workflows = await prisma.workflow.findMany({
      where: { deletedAt: null },
      include: {
        steps: { orderBy: { stepOrder: 'asc' } },
        instances: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: workflows });
  } catch (error) {
    console.error('Workflows GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const count = await prisma.workflow.count();
    const code = `WF-${String(count + 1).padStart(3, '0')}`;

    const workflow = await prisma.workflow.create({
      data: {
        code,
        name: data.name,
        description: data.description,
        module: data.module,
        triggerEvent: data.triggerEvent || 'manual',
        steps: data.steps ? { create: data.steps.map((s: any, i: number) => ({ ...s, stepOrder: i + 1 })) } : undefined,
      },
      include: { steps: true },
    });
    return NextResponse.json({ success: true, data: workflow }, { status: 201 });
  } catch (error) {
    console.error('Workflows POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
