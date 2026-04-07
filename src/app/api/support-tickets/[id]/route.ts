import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        requester: data.requester,
        assignee: data.assignee,
      }
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error soft deleting support ticket:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
