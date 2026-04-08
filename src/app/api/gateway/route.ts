import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const integrations = await prisma.gatewayIntegration.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: integrations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi server' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, category, name, apiKey, endpoint, webhookUrl, status } = body;

    if (!provider || !name || !category) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc (provider, category, name)' },
        { status: 400 }
      );
    }

    const integration = await prisma.gatewayIntegration.create({
      data: {
        provider,
        category,
        name,
        apiKey,
        endpoint,
        webhookUrl,
        status: status || 'inactive'
      }
    });

    return NextResponse.json({ success: true, data: integration }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi server' },
      { status: 500 }
    );
  }
}
