import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/payroll — Danh sách bảng lương
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');

    const where: any = { deletedAt: null };
    if (period) where.period = period;
    if (status && status !== 'all') where.status = status;
    if (employeeId) where.employeeId = employeeId;

    const payrolls = await prisma.payrollRecord.findMany({
      where,
      include: {
        employee: { select: { employeeCode: true, fullName: true, position: true, department: { select: { name: true } } } },
      },
      orderBy: [{ period: 'desc' }, { createdAt: 'desc' }],
      take: 200,
    });

    const data = payrolls.map(p => ({
      id: p.id,
      code: p.code,
      employeeId: p.employeeId,
      employeeCode: p.employee.employeeCode,
      employeeName: p.employee.fullName,
      position: p.employee.position,
      department: p.employee.department.name,
      period: p.period,
      baseSalary: p.baseSalary,
      allowances: p.allowances,
      overtime: p.overtime,
      bonus: p.bonus,
      deductions: p.deductions,
      socialInsurance: p.socialInsurance,
      healthInsurance: p.healthInsurance,
      personalTax: p.personalTax,
      netSalary: p.netSalary,
      workingDays: p.workingDays,
      paidLeave: p.paidLeave,
      unpaidLeave: p.unpaidLeave,
      status: p.status,
      paidAt: p.paidAt?.toISOString() || null,
      note: p.note,
    }));

    // Summary stats
    const totalNet = data.reduce((s, p) => s + p.netSalary, 0);
    const totalBase = data.reduce((s, p) => s + p.baseSalary, 0);
    const totalBonus = data.reduce((s, p) => s + p.bonus, 0);
    const totalDeductions = data.reduce((s, p) => s + p.deductions + p.socialInsurance + p.healthInsurance + p.personalTax, 0);

    return NextResponse.json({
      success: true,
      data,
      summary: { totalNet, totalBase, totalBonus, totalDeductions, count: data.length },
    });
  } catch (error) {
    console.error('Payroll GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/payroll — Tạo bản ghi lương
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Auto-generate code
    const count = await prisma.payrollRecord.count();
    const code = `PAY-${String(count + 1).padStart(4, '0')}`;

    // Calculate netSalary
    const totalIncome = (data.baseSalary || 0) + (data.allowances || 0) + (data.overtime || 0) + (data.bonus || 0);
    const totalDeduction = (data.deductions || 0) + (data.socialInsurance || 0) + (data.healthInsurance || 0) + (data.personalTax || 0);
    const netSalary = totalIncome - totalDeduction;

    const payroll = await prisma.payrollRecord.create({
      data: {
        code,
        employeeId: data.employeeId,
        period: data.period,
        baseSalary: data.baseSalary || 0,
        allowances: data.allowances || 0,
        overtime: data.overtime || 0,
        bonus: data.bonus || 0,
        deductions: data.deductions || 0,
        socialInsurance: data.socialInsurance || 0,
        healthInsurance: data.healthInsurance || 0,
        personalTax: data.personalTax || 0,
        netSalary,
        workingDays: data.workingDays || 0,
        paidLeave: data.paidLeave || 0,
        unpaidLeave: data.unpaidLeave || 0,
        status: 'draft',
        note: data.note || null,
      },
    });

    return NextResponse.json({ success: true, data: payroll }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Nhân viên đã có bản lương cho kỳ này' }, { status: 409 });
    }
    console.error('Payroll POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
