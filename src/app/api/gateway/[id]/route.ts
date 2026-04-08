import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Only extract changeable fields
    const { name, apiKey, endpoint, webhookUrl, status, errorLog, lastSyncAt } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (apiKey !== undefined) dataToUpdate.apiKey = apiKey;
    if (endpoint !== undefined) dataToUpdate.endpoint = endpoint;
    if (webhookUrl !== undefined) dataToUpdate.webhookUrl = webhookUrl;
    if (status !== undefined) dataToUpdate.status = status;
    if (errorLog !== undefined) dataToUpdate.errorLog = errorLog;
    if (lastSyncAt !== undefined) dataToUpdate.lastSyncAt = new Date(lastSyncAt);

    const integration = await prisma.gatewayIntegration.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json({ success: true, data: integration });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi cập nhật' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.gatewayIntegration.delete({
      where: { id }
    });
    return NextResponse.json({ success: true, message: 'Đã xóa cấu hình' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi server' },
      { status: 500 }
    );
  }
}
