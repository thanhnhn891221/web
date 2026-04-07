import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    const campaign = await prisma.marketingCampaign.update({
      where: { id },
      data: {
        name: data.name,
        channel: data.channel,
        budget: parseFloat(data.budget),
        spent: parseFloat(data.spent),
        status: data.status,
        period: data.period,
      }
    });

    return NextResponse.json({ success: true, data: campaign });
  } catch (error) {
    console.error('Error updating marketing campaign:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const campaign = await prisma.marketingCampaign.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: campaign });
  } catch (error) {
    console.error('Error soft deleting marketing campaign:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
