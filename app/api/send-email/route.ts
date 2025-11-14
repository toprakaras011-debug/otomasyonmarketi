import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { logger } from '@/lib/logger';
import { getErrorMessage, getErrorCategory } from '@/lib/error-messages';

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
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('E-posta gönderilirken hata oluştu', errorObj, {
      code: (error as any)?.code,
    });

    const category = getErrorCategory(errorObj);
    const errorMessage = getErrorMessage(errorObj, category, 'E-posta gönderilirken bir hata oluştu');

    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
