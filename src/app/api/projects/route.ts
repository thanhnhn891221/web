import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.researchProject.findMany({ 
      where: { deletedAt: null },
      orderBy: { code: 'asc' } 
    });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const project = await prisma.researchProject.create({
      data: {
        code: data.code || `RD-${Date.now()}`,
        name: data.name,
        phase: data.phase || 'concept',
        lead: data.lead,
        teamSize: parseInt(data.teamSize) || 1,
        budget: parseFloat(data.budget) || 0,
        deadline: data.deadline ? new Date(data.deadline) : null,
      }
    });
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
