import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import type { Transporter } from 'nodemailer';

// E-posta gönderim ayarları - Environment variables'dan alınmalı
const createTransporter = (): Transporter => {
  const emailPort = parseInt(process.env.EMAIL_PORT || '465', 10);
  const isSecure = emailPort === 465 || process.env.EMAIL_SECURE === 'true';
  
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('E-posta yapılandırması eksik. EMAIL_HOST, EMAIL_USER ve EMAIL_PASSWORD ortam değişkenlerini ayarlayın.');
  }
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: emailPort,
    secure: isSecure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
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
    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'info@otomasyonmagazasi.com';
    const info = await transporter.sendMail({
      from: `"${from}" <${emailFrom}>`,
      to: to || emailFrom,
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

  } catch (error: unknown) {
    const err = error as Error & { code?: string; stack?: string };
    
    if (process.env.NODE_ENV === 'development') {
    console.error('E-posta gönderilirken hata oluştu:', {
        message: err.message,
        code: err.code,
        stack: err.stack
    });
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'E-posta gönderilirken bir hata oluştu',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    );
  }
}
