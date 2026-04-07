import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany({ 
      where: { deletedAt: null },
      orderBy: { key: 'asc' } 
    });
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const setting = await prisma.systemSetting.create({
      data: {
        key: data.key,
        value: data.value,
        group: data.group || 'general',
        type: data.type || 'string',
      }
    });
    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error('Setting creation error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const setting = await prisma.systemSetting.update({
      where: { key: data.key },
      data: { value: data.value }
    });
    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error('Setting update error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// In case we want to support record deletion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 });

    const setting = await prisma.systemSetting.update({
      where: { key },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error('Setting delete error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
