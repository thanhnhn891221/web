import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({ 
      where: { deletedAt: null },
      orderBy: { name: 'asc' } 
    });
    const data = suppliers.map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      contact: s.contact || '',
      email: s.email || '',
      phone: s.phone || '',
      category: s.category || '',
      rating: s.rating || 4.5,
      totalOrders: 0,
      status: s.status || 'active',
    }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const supplier = await prisma.supplier.create({
      data: {
        code: data.code,
        name: data.name,
        contact: data.contact,
        email: data.email,
        phone: data.phone,
        category: data.category,
        status: data.status || 'active',
      }
    });
    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}
