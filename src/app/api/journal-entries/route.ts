import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { deletedAt: null };
    if (status && status !== 'all') where.status = status;

    const entries = await prisma.journalEntry.findMany({
      where,
      include: { lines: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 200,
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error('Journal Entries GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const count = await prisma.journalEntry.count();
    const code = `JE-${String(count + 1).padStart(4, '0')}`;

    const entry = await prisma.journalEntry.create({
      data: {
        code,
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description,
        type: data.type || 'general',
        totalDebit: data.totalDebit || 0,
        totalCredit: data.totalCredit || 0,
        note: data.note,
        lines: data.lines ? { create: data.lines } : undefined,
      },
      include: { lines: true },
    });
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error('Journal Entries POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
