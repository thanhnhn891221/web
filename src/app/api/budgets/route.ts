import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const budgets = await prisma.budget.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: budgets });
  } catch (error) {
    console.error('Budgets fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const budget = await prisma.budget.create({
      data: {
        departmentName: data.departmentName,
        departmentId: data.departmentId,
        period: data.period || '2026',
        allocated: parseFloat(data.allocated) || 0,
        spent: parseFloat(data.spent) || 0,
        status: data.status || 'active',
      }
    });
    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error('Budget creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
