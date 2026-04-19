import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assigneeId = searchParams.get('assigneeId');
    const departmentId = searchParams.get('departmentId');

    const where: any = { deletedAt: null };
    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (departmentId) where.departmentId = departmentId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { employeeCode: true, fullName: true } },
        reporter: { select: { fullName: true } },
        department: { select: { name: true } },
        comments: { select: { id: true } },
        subTasks: { select: { id: true, status: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: 300,
    });

    const data = tasks.map(t => ({
      id: t.id,
      code: t.code,
      title: t.title,
      description: t.description,
      assigneeName: t.assignee?.fullName || '-',
      reporterName: t.reporter?.fullName || '-',
      department: t.department?.name || '-',
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate?.toISOString() || null,
      startDate: t.startDate?.toISOString() || null,
      completedAt: t.completedAt?.toISOString() || null,
      estimatedHours: t.estimatedHours,
      actualHours: t.actualHours,
      tags: t.tags,
      commentCount: t.comments.length,
      subTaskCount: t.subTasks.length,
      subTaskDone: t.subTasks.filter(s => s.status === 'done').length,
      createdAt: t.createdAt.toISOString(),
    }));

    // Stats
    const stats = {
      total: data.length,
      todo: data.filter(d => d.status === 'todo').length,
      inProgress: data.filter(d => d.status === 'in_progress').length,
      review: data.filter(d => d.status === 'review').length,
      done: data.filter(d => d.status === 'done').length,
    };

    return NextResponse.json({ success: true, data, stats });
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const count = await prisma.task.count();
    const code = `TASK-${String(count + 1).padStart(4, '0')}`;

    const task = await prisma.task.create({
      data: {
        code,
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId || null,
        reporterId: data.reporterId || null,
        departmentId: data.departmentId || null,
        priority: data.priority || 'medium',
        status: data.status || 'todo',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        estimatedHours: data.estimatedHours,
        tags: data.tags,
        parentTaskId: data.parentTaskId || null,
      },
    });
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
