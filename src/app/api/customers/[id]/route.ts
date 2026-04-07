import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        email: data.email,
        phone: data.phone,
        tier: data.tier,
      }
    });

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error soft deleting customer:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
