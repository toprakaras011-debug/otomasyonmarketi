import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/contact/route';
import { NextRequest } from 'next/server';

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      verify: vi.fn((callback) => callback(null, true)),
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    })),
  },
}));

// Mock rate limit
vi.mock('@/lib/rate-limit', () => ({
  default: vi.fn(() => ({
    check: vi.fn().mockResolvedValue(true),
  })),
}));

describe('API: Contact Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set required env vars
    process.env.EMAIL_HOST = 'smtp.test.com';
    process.env.EMAIL_PORT = '465';
    process.env.EMAIL_USER = 'test@test.com';
    process.env.EMAIL_PASSWORD = 'test-password';
    process.env.EMAIL_FROM = 'test@test.com';
  });

  it('should return 400 for missing fields', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'test@test.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('tüm alanları doldurunuz');
  });

  it('should return 400 for invalid email', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        subject: 'Test Subject',
        message: 'Test message',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Geçerli bir e-posta adresi');
  });

  it('should return 400 for invalid JSON', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Geçersiz JSON');
  });

  it('should successfully send email with valid data', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('başarıyla gönderildi');
    expect(data.messageId).toBe('test-message-id');
  });
});

