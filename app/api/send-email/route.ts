import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import type { Transporter } from 'nodemailer';

// E-posta gönderim ayarları
const createTransporter = (): Transporter => {
  return nodemailer.createTransport({
    host: 'mail.otomasyonmagazasi.com.tr',
    port: 465,
    secure: true,
    auth: {
      user: 'info@otomasyonmagazasi.com.tr',
      pass: 'Qwerty667334',
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2' as const
    }
  });
};

export async function POST(req: Request) {
  try {
    const { to, from, subject, text, html } = await req.json();

    // E-posta göndericisini oluştur
    const transporter = createTransporter();

    // E-posta gönder
    const info = await transporter.sendMail({
      from: `"${from}" <info@otomasyonmagazasi.com.tr>`,
      to: to || 'info@otomasyonmagazasi.com.tr',
      replyTo: from,
      subject: subject || 'İletişim Formu',
      text: text || '',
      html: html || ''
    });

    return NextResponse.json({
      success: true,
      message: 'E-posta başarıyla gönderildi',
      messageId: info.messageId
    });

  } catch (error: any) {
    console.error('E-posta gönderilirken hata oluştu:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        success: false, 
        message: 'E-posta gönderilirken bir hata oluştu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
