import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { deletedAt: null };
    if (status && status !== 'all') where.status = status;

    const campaigns = await prisma.marketingCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('Marketing Campaigns GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const campaign = await prisma.marketingCampaign.create({
      data: {
        name: data.name,
        channel: data.channel || 'social',
        budget: data.budget || 0,
        spent: data.spent || 0,
        leads: data.leads || 0,
        conversions: data.conversions || 0,
        status: data.status || 'planned',
        period: data.period,
      },
    });
    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error) {
    console.error('Marketing Campaigns POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
