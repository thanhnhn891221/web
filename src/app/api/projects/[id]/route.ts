import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    const project = await prisma.researchProject.update({
      where: { id },
      data: {
        name: data.name,
        phase: data.phase,
        lead: data.lead,
        teamSize: parseInt(data.teamSize),
        budget: parseFloat(data.budget),
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      }
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Error updating research project:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const project = await prisma.researchProject.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Error soft deleting research project:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
