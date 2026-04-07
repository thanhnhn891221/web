import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tickets = await prisma.supportTicket.findMany({ 
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' } 
    });
    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const ticket = await prisma.supportTicket.create({
      data: {
        code: data.code || `TKT-${Math.floor(Math.random() * 9000) + 1000}`,
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
        status: data.status || 'open',
        requester: data.requester,
        assignee: data.assignee,
      }
    });
    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
