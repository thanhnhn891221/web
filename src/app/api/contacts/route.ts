import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');

    const where: any = { deletedAt: null };
    if (status && status !== 'all') where.status = status;
    if (source && source !== 'all') where.source = source;

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 300,
    });

    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Contacts GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const contact = await prisma.contact.create({ data });
    return NextResponse.json({ success: true, data: contact }, { status: 201 });
  } catch (error) {
    console.error('Contacts POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
