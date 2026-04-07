import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const drivers = await prisma.driver.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const driver = await prisma.driver.create({
      data: {
        name: data.name,
        phone: data.phone,
        vehicle: data.vehicle,
        licensePlate: data.licensePlate,
        status: data.status || 'available',
      }
    });
    return NextResponse.json({ success: true, data: driver });
  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
