import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const where: any = { deletedAt: null };
    // In a real app we'd filter rooms by participants, but for simplicity we return all
    
    const rooms = await prisma.chatRoom.findMany({
      where,
      include: {
        members: {
          include: {
            user: { select: { name: true, id: true } }
          }
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Chat Rooms GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const room = await prisma.chatRoom.create({
      data: {
        name: data.name,
        type: data.type || 'direct',
        members: {
          create: data.participantIds.map((id: string) => ({ userId: id, role: 'member' }))
        }
      },
      include: { members: true },
    });
    return NextResponse.json({ success: true, data: room }, { status: 201 });
  } catch (error) {
    console.error('Chat Rooms POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
