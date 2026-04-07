import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    const risk = await prisma.risk.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        impact: data.impact,
        likelihood: data.likelihood,
        status: data.status,
        owner: data.owner,
      }
    });

    return NextResponse.json({ success: true, data: risk });
  } catch (error) {
    console.error('Risk update error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const risk = await prisma.risk.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: risk });
  } catch (error) {
    console.error('Risk soft delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
