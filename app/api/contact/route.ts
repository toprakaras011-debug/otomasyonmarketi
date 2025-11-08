import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import rateLimit from '@/lib/rate-limit';

// Rate limiting configuration
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max users per minute
});

// SMTP ayarları
const envVars = {
  EMAIL_HOST: 'mail.otomasyonmagazasi.com.tr',
  EMAIL_PORT: '465',  // 587 yerine 465 kullanıyoruz
  EMAIL_USER: 'info@otomasyonmagazasi.com.tr',
  EMAIL_PASSWORD: 'Qwerty667334',
  EMAIL_FROM: 'info@otomasyonmagazasi.com.tr',
  EMAIL_SECURE: 'true'  // 465 portu için secure true olmalı
};

// Ortam değişkenlerini manuel olarak ayarla
for (const [key, value] of Object.entries(envVars)) {
  process.env[key] = value;
}

// Basit bir ping testi yapalım
console.log('SMTP sunucusu kontrol ediliyor...');
console.log(`Hedef: ${envVars.EMAIL_HOST}:${envVars.EMAIL_PORT}`);

export async function POST(req: Request) {
  console.log('İstek alındı, başlıklar:', JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));
  
  try {
    // İstek gövdesini oku
    const body = await req.text();
    console.log('Ham istek gövdesi:', body);
    
    // JSON'a çevirmeye çalış
    let jsonData;
    try {
      jsonData = JSON.parse(body);
      console.log('Ayrıştırılmış JSON verisi:', jsonData);
    } catch (parseError) {
      console.error('JSON ayrıştırma hatası:', parseError);
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
    const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_FROM'];
    const envVars = {
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '***' : 'YOK',
      EMAIL_FROM: process.env.EMAIL_FROM,
      EMAIL_SECURE: process.env.EMAIL_SECURE
    };
    
    console.log('Ortam değişkenleri:', JSON.stringify(envVars, null, 2));
    
    // Tüm ortam değişkenlerini kontrol et
    for (const [key, value] of Object.entries(envVars)) {
      if (!value && key !== 'EMAIL_PASSWORD') { // EMAIL_PASSWORD dışındaki boş değerleri kontrol et
        console.error(`Hata: ${key} ortam değişkeni tanımlı değil veya boş`);
      }
    }

    // E-posta gönderim ayarları
    const transporterConfig = {
      host: process.env.EMAIL_HOST,
      port: 465,  // Doğrudan 465 portunu kullan
      secure: true,  // 465 portu için secure true olmalı
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,  // Kendi imzalı sertifikalar için
        minVersion: 'TLSv1.2'      // Minimum TLS sürümü
      },
      // Zaman aşımlarını ayarla
      connectionTimeout: 10000, // 10 saniye
      greetingTimeout: 10000,   // 10 saniye
      socketTimeout: 30000,     // 30 saniye
      // Hata ayıklama için
      debug: true,
      logger: true
    } as const;  // Tip güvenliği için
    
    console.log('Transporter ayarları:', JSON.stringify({
      ...transporterConfig,
      auth: { ...transporterConfig.auth, pass: '***' } // Şifreyi güvenli şekilde logla
    }, null, 2));
    
    try {
      console.log('Transporter oluşturuluyor...');
      const transporter = nodemailer.createTransport(transporterConfig);
      
      // Bağlantıyı test et
      console.log('SMTP bağlantısı test ediliyor...');
      await new Promise((resolve, reject) => {
        transporter.verify(function(error, success) {
          if (error) {
            console.error('SMTP bağlantı testi başarısız:', error);
            reject(error);
          } else {
            console.log('SMTP bağlantı testi başarılı!');
            resolve(success);
          }
        });
      });

    // E-posta içeriği
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: 'info@otomasyonmagazasi.com.tr',
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
            Bu e-posta, otomasyonmagazasi.com.tr üzerindeki iletişim formu aracılığıyla gönderilmiştir.
            <br>Gönderim Tarihi: ${new Date().toLocaleString('tr-TR')}
          </p>
        </div>
      `
    };

      // E-postayı gönder
      console.log('E-posta gönderiliyor...');
      const info = await transporter.sendMail(mailOptions);
      console.log('E-posta gönderildi:', info.messageId);

      return NextResponse.json({ 
        success: true, 
        message: 'Mesajınız başarıyla gönderildi!',
        messageId: info.messageId 
      });
    } catch (error: unknown) {
      const smtpError = error as Error & { code?: string; command?: string; response?: string };
      console.error('SMTP işlemi sırasında hata oluştu:', {
        name: smtpError.name,
        message: smtpError.message,
        code: smtpError.code,
        command: smtpError.command,
        stack: smtpError.stack,
        response: smtpError.response
      });
      
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
  } catch (error: any) {
    console.error('Beklenmeyen hata:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.',
        error: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}
