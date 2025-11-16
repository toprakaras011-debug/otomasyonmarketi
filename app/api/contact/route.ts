import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import rateLimit from '@/lib/rate-limit';

// Rate limiting configuration
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max users per minute
});

// SMTP ayarları - Environment variables'dan alınmalı
// Production'da bu değerler .env dosyasından gelecek

// Basit bir ping testi yapalım
// SMTP configuration check

export async function POST(req: Request) {
  // Request received
  
  try {
    // İstek gövdesini oku
    const body = await req.text();
      // Raw request body
    
    // JSON'a çevirmeye çalış
    let jsonData;
    try {
      jsonData = JSON.parse(body);
      // Parsed JSON data
    } catch (parseError) {
      // JSON parse error
      return NextResponse.json(
        { success: false, error: 'Geçersiz JSON verisi' },
        { status: 400 }
      );
    }
    // Rate limiting kontrolü
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await limiter.check(10, ip); // 10 requests per minute

    const { name, email, subject, message } = jsonData;

    // Giriş doğrulama
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Lütfen tüm alanları doldurunuz.' },
        { status: 400 }
      );
    }

    // E-posta doğrulama
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    // E-posta gönderimi için gerekli ortam değişkenlerini kontrol et
    const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASSWORD'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `E-posta yapılandırması eksik. Eksik değişkenler: ${missingVars.join(', ')}` 
        },
        { status: 500 }
      );
    }

    // E-posta gönderim ayarları
    const emailPort = parseInt(process.env.EMAIL_PORT || '465', 10);
    const isSecure = emailPort === 465 || process.env.EMAIL_SECURE === 'true';
    
    const transporterConfig = {
      host: process.env.EMAIL_HOST!,
      port: emailPort,
      secure: isSecure,
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASSWORD!,
      },
      tls: {
        rejectUnauthorized: false,  // Kendi imzalı sertifikalar için
        minVersion: 'TLSv1.2' as const      // Minimum TLS sürümü
      },
      // Zaman aşımlarını ayarla
      connectionTimeout: 10000, // 10 saniye
      greetingTimeout: 10000,   // 10 saniye
      socketTimeout: 30000,     // 30 saniye
      // Production'da debug kapalı
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development'
    };
    
    try {
      // Creating transporter
      const transporter = nodemailer.createTransport(transporterConfig);
      
      // Bağlantıyı test et
      // Testing SMTP connection
      await new Promise((resolve, reject) => {
        transporter.verify(function(error, success) {
          if (error) {
            // SMTP connection test failed
            reject(error);
          } else {
            // SMTP connection test successful
            resolve(success);
          }
        });
      });

    // E-posta içeriği
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: 'info@otomasyonmagazasi.com',
      replyTo: email,
      subject: `İletişim Formu: ${subject}`,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Yeni İletişim Formu Gönderimi</h2>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Ad Soyad:</strong> ${name}</p>
            <p><strong>E-posta:</strong> <a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a></p>
            <p><strong>Konu:</strong> ${subject}</p>
            
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              <strong>Mesaj:</strong>
              <p style="white-space: pre-line; margin-top: 10px; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          
          <p style="font-size: 12px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
            Bu e-posta, otomasyonmagazasi.com üzerindeki iletişim formu aracılığıyla gönderilmiştir.
            <br>Gönderim Tarihi: ${new Date().toLocaleString('tr-TR')}
          </p>
        </div>
      `
    };

      // E-postayı gönder
      // Sending email
      const info = await transporter.sendMail(mailOptions);
      // Email sent successfully

      return NextResponse.json({ 
        success: true, 
        message: 'Mesajınız başarıyla gönderildi!',
        messageId: info.messageId 
      });
    } catch (error: unknown) {
      const smtpError = error as Error & { code?: string; command?: string; response?: string };
      // SMTP operation error
      
      let errorMessage = 'E-posta gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.';
      
      // SMTP hataları için daha açıklayıcı mesajlar
      if (smtpError.code === 'ECONNECTION' || smtpError.code === 'ETIMEDOUT') {
        errorMessage = 'E-posta sunucusuna bağlanılamadı. Lütfen daha sonra tekrar deneyiniz.';
      } else if (smtpError.code === 'EAUTH') {
        errorMessage = 'E-posta sunucusu kimlik doğrulama hatası. Kullanıcı adı veya şifre hatalı olabilir.';
      } else if (smtpError.code === 'EENVELOPE') {
        errorMessage = 'Geçersiz e-posta adresi. Lütfen e-posta adresinizi kontrol ediniz.';
      } else if (smtpError.message) {
        errorMessage += ` Hata detayı: ${smtpError.message}`;
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage,
          error: smtpError.message,
          code: smtpError.code
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    // Unexpected error
    const err = error as Error & { code?: string };
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.',
        error: err.message,
        code: err.code
      },
      { status: 500 }
    );
  }
}
