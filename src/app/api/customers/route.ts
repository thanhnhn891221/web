import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({ 
      where: { deletedAt: null },
      orderBy: { name: 'asc' } 
    });
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        type: data.type || 'B2B',
        email: data.email,
        phone: data.phone,
        tier: data.tier || 'standard',
        rating: 4.5,
      }
    });
    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
