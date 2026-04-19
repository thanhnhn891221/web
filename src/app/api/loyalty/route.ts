import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/loyalty — Loyalty tiers + points summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // tiers, points, campaigns

    if (type === 'tiers') {
      const tiers = await prisma.loyaltyTier.findMany({ orderBy: { sortOrder: 'asc' } });
      return NextResponse.json({ success: true, data: tiers });
    }

    if (type === 'campaigns') {
      const campaigns = await prisma.loyaltyCampaign.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
      return NextResponse.json({ success: true, data: campaigns });
    }

    // Default: points transactions
    const customerId = searchParams.get('customerId');
    const where: any = {};
    if (customerId) where.customerId = customerId;

    const points = await prisma.loyaltyPoint.findMany({
      where,
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return NextResponse.json({ success: true, data: points });
  } catch (error) {
    console.error('Loyalty GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/loyalty — Create tier, campaign, or point transaction
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { type, ...payload } = data;

    if (type === 'tier') {
      const tier = await prisma.loyaltyTier.create({ data: payload });
      return NextResponse.json({ success: true, data: tier }, { status: 201 });
    }
    if (type === 'campaign') {
      const campaign = await prisma.loyaltyCampaign.create({ data: payload });
      return NextResponse.json({ success: true, data: campaign }, { status: 201 });
    }
    // Default: point transaction
    const point = await prisma.loyaltyPoint.create({ data: payload });
    return NextResponse.json({ success: true, data: point }, { status: 201 });
  } catch (error) {
    console.error('Loyalty POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
