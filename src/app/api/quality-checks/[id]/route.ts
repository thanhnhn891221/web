import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    const check = await prisma.qualityCheck.update({
      where: { id },
      data: {
        product: data.product,
        batch: data.batch,
        type: data.type,
        inspector: data.inspector,
        result: data.result,
        defectRate: parseFloat(data.defectRate),
        note: data.note,
      }
    });

    return NextResponse.json({ success: true, data: check });
  } catch (error) {
    console.error('Error updating quality check:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const check = await prisma.qualityCheck.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: check });
  } catch (error) {
    console.error('Error soft deleting quality check:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
