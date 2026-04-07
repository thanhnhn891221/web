import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({ 
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' } 
    });
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source || 'Website',
        status: data.status || 'new',
        potential: data.potential || 'medium',
        note: data.note,
      }
    });
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
