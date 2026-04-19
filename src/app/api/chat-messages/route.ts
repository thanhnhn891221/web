import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { roomId, deletedAt: null },
      include: {
        sender: { select: { name: true, id: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error('Chat Messages GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const message = await prisma.chatMessage.create({
      data: {
        roomId: data.roomId,
        senderId: data.senderId,
        content: data.content,
        type: data.type || 'text',
      },
    });
    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error('Chat Messages POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
