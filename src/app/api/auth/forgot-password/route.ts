import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Vui lòng cung cấp email' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // Return success anyway to prevent email enumeration
      return NextResponse.json({ success: true, message: 'Nếu email tồn tại trong hệ thống, hướng dẫn khôi phục mật khẩu đã được gửi.' });
    }

    // In a real application, you would generate a token, save to db, and send an email using nodemailer.
    // For this ERP demo, we simulate the success response.
    console.log(`[AUTH] Password reset requested for: ${email}`);

    return NextResponse.json({ 
        success: true, 
        message: 'Nếu email tồn tại trong hệ thống, hướng dẫn khôi phục mật khẩu đã được gửi vào hòm thư của bạn.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
