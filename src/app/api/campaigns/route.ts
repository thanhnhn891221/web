import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const campaigns = await prisma.marketingCampaign.findMany({ 
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' } 
    });
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const campaign = await prisma.marketingCampaign.create({
      data: {
        name: data.name,
        channel: data.channel,
        budget: parseFloat(data.budget) || 0,
        spent: parseFloat(data.spent) || 0,
        status: data.status || 'planned',
        period: data.period,
      }
    });
    return NextResponse.json({ success: true, data: campaign });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
