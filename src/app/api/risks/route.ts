import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const risks = await prisma.risk.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: risks });
  } catch (error) {
    console.error('Risks fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const risk = await prisma.risk.create({
      data: {
        code: data.code || `RSK-${Date.now()}`,
        title: data.title,
        description: data.description,
        category: data.category || 'operational',
        impact: data.impact || 'medium',
        likelihood: data.likelihood || 'medium',
        status: data.status || 'identified',
        owner: data.owner,
      }
    });
    return NextResponse.json({ success: true, data: risk });
  } catch (error) {
    console.error('Risk creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
