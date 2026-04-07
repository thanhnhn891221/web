import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        contact: data.contact,
        email: data.email,
        phone: data.phone,
        category: data.category,
        status: data.status,
      }
    });

    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const supplier = await prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    console.error('Error soft deleting supplier:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
