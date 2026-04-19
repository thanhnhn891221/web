import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'all') where.status = status;

    const commissions = await prisma.affiliateCommission.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });
    return NextResponse.json({ success: true, data: commissions });
  } catch (error) {
    console.error('Affiliate Commissions GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const commission = await prisma.affiliateCommission.create({ data });
    return NextResponse.json({ success: true, data: commission }, { status: 201 });
  } catch (error) {
    console.error('Affiliate Commissions POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
